from dotenv import load_dotenv

load_dotenv()
from s3 import download_by_key

from db import *
from concurrent.futures import ThreadPoolExecutor
import traceback
import time

try:
    from grader import AIGrader
except ImportError:
    from .grader import AIGrader

WORKERS = 4
from tempfile import NamedTemporaryFile

def run_file_event(db: DB, id: int, task_type: int, prompt_info: dict, files: list[str]):
    """
    Handles file-based events.
    This version no longer reads from the filesystem or S3.
    It loads text directly from the database cache.
    """
    print(f"Processing file event {id} with files: {files}")
    grader = AIGrader()

    # Each file in the event is referenced by its key
    initial = str(files[0])
    fileInfo = db.get_file(initial)

    # Determine whether this file is a teacher key or student submission
    is_teacher = fileInfo["file_role"] == FileRole.TEACHER_KEY.value
    is_student = fileInfo["file_role"] == FileRole.STUDENT_RESPONSE.value

    #  Get preloaded text from cache instead of reading a file

    with NamedTemporaryFile(suffix=".pdf") as tmp:
        tmp=tmp.name
        download_by_key(initial, tmp)
        print("DOING THE OCR")

        # Pass raw text directly into the grader
        if is_teacher:
            out = grader.read_teacher_file(tmp)
        elif is_student:
            out = grader.read_student_file(tmp)
        else:
            raise ValueError(f"Unknown file role for {initial}")

        #  Update database state
        db.complete_file_task(id)
        db.set_file_cache(initial, out)

    print(f" Completed file task {id} ({'teacher' if is_teacher else 'student'})")


def run_text_event(db: DB, id: int, task_type: int, prompt_info: dict, texts: list[str], files: list[str]):
    """
    Handles text-based events.
    Combines preloaded teacher + student text and runs grading.
    """
    print(f"Processing text event {id} using files: {files}")
    grader = AIGrader()

    # Load all cached file texts
    files_text = [db.get_file_cache(str(f)) for f in files]

    # Basic structure: [student, teacher, context...]
    student_text = files_text[0] if len(files_text) > 0 else None
    teacher_text = files_text[1] if len(files_text) > 1 else None
    context_files_text = files_text[2:] if len(files_text) > 2 else []

    if not student_text or not teacher_text:
        print(f" Missing student or teacher text for text event {id}")
        return

    # Run the grading logic
    result = grader.grade_submission(student_text, teacher_text)

    #  Cache the result and mark complete
    db.complete_text_task(id)
    print(result)



def main():
    db = DB()
    print("Starting event runner")

    with ThreadPoolExecutor(max_workers=WORKERS) as exec:
        futures = []
        while True:
            file_event = db.dequeue_file_task()
            text_event = db.dequeue_text_task()


            if file_event is not None:
                futures.append(exec.submit(run_file_event, db, **file_event))

            if text_event is not None:
                futures.append(exec.submit(run_text_event, db, **text_event))

            # Wait for all tasks to finish
            for fut in futures:
                if not fut.running() and fut.exception():
                    traceback.print_exception(fut.exception())
            time.sleep(1)


if __name__ == "__main__":
    main()
