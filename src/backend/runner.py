from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from db import *
from concurrent.futures import ThreadPoolExecutor, Future
import traceback
import time
import os
import tempfile
import s3

try:
    from grader import AIGrader
except ImportError:
    from .grader import AIGrader

WORKERS = 1

# Global cache for teacher data
TEACHER_CACHE = {}

def run_file_event(db: DB, id: int, task_type: int, prompt_info: dict, files: list[str]):
    initial = str(files[0])
    grader = AIGrader()

    fileInfo = db.get_file(initial)
    is_teacher = fileInfo["file_role"] == FileRole.TEACHER_KEY.value
    is_student = fileInfo["file_role"] == FileRole.STUDENT_RESPONSE.value

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp = tmp.name
        s3.download_by_key(initial, tmp)


        if is_teacher:
            out = grader.read_teacher_files(tmp)
            TEACHER_CACHE["answer_key"] = out
        elif is_student:
            if TEACHER_CACHE:
                out = grader.read_student_file(tmp, teacher_context=TEACHER_CACHE)
            else:
                print("⚠️ No teacher file cached — reading student file alone.")
                out = grader.read_student_file(tmp)

        db.complete_file_task(id)
        db.set_file_cache(initial, out)


def run_text_event(db: DB, id: int, task_type: int, prompt_info: dict, texts: list[str]):
    grader = AIGrader()
    combined_text = "\n\n".join(texts)

    if task_type == TaskType.SUMMARIZE.value:
        out = combined_text
    else:
        out = combined_text

    db.complete_text_task(id)


def preload_teacher_files(db: DB, grader: AIGrader):
    """
    Loads the teacher answer key PDF into memory once at startup.
    """
    print("Preloading teacher file...")

    teacher_pdf_path = "/Users/kgozon/Documents/midterm1_solution.pdf"
    try:
        out = grader.read_teacher_files(teacher_pdf_path)
        TEACHER_CACHE["answer_key"] = out
        print(f"✅ Cached teacher file: {teacher_pdf_path}")
    except Exception as e:
        print(f"⚠️ Failed to preload teacher file: {e}")


def main():
    db: DB = DB()
    print("Starting event runner")
    grader = AIGrader()
    preload_teacher_files(db, grader)

    with ThreadPoolExecutor(max_workers=WORKERS) as exec:
        file_event = db.dequeue_file_task()
        text_event = db.dequeue_text_task()

        futures = []

        if file_event is not None:
            futures.append(exec.submit(run_file_event, db, **file_event))
        else:
            print("No file tasks in queue")

        if text_event is not None:
            futures.append(exec.submit(run_text_event, db, **text_event))
        else:
            print("No text tasks in queue")

        for fut in futures:
            while fut.running():
                time.sleep(1)
            if fut.exception():
                traceback.print_exception(fut.exception())


if __name__ == "__main__":
    main()
