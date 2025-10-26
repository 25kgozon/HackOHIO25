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



def run_file_event(db : DB, id : int, task_type : int, prompt_info : dict, files : list[str]):
    initial = str(files[0])

     
    grader = AIGrader()

    fileInfo = db.get_file(initial)
    is_teacher = fileInfo["file_role"] == FileRole.TEACHER_KEY.value
    is_student = fileInfo["file_role"] == FileRole.STUDENT_RESPONSE.value
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp = tmp.name

        # Might throw botocore.exceptions.ClientError
        s3.download_by_key(initial, tmp)
        if is_teacher:
            out = grader.read_teacher_files(tmp)
        elif is_student:
            out = grader.read_student_file(tmp)

        db.complete_file_task(id)
        db.set_file_cache(initial, out)


def run_text_event(db: DB, id: int, task_type: int, prompt_info: dict, texts: list[str], files: list[UUID]):
    """
    Process text tasks, similar to file tasks.
    """
    grader = AIGrader()


    files_text : list[str] = list(map(lambda f: db.get_file_cache(str(f)), files) )

    print(files_text)

    # db.complete_text_task(id)




def main():
    db: DB = DB()
    print("Starting event runner")

    with ThreadPoolExecutor(max_workers=WORKERS) as exec:
        # 1. Dequeue a file task
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

        # Wait for all futures to finish
        for fut in futures:
            while fut.running():
                time.sleep(1)
            if fut.exception():
                traceback.print_exception(fut.exception())






if __name__ == "__main__":
    main()
