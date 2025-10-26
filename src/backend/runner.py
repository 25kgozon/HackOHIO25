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



def main():
    db: DB = DB()
    # Todo: Make list
    running: Future

    print("Starting event runner")

    with ThreadPoolExecutor(max_workers=WORKERS) as exec:
        event = db.dequeue_file_task()
        if event is not None:
            running = exec.submit(run_file_event, db, **event)
        else:
            print("No task")
            return
        while running.running():
            time.sleep(1)
        if running.exception():
            traceback.print_exception(running.exception())
    

    





if __name__ == "__main__":
    main()
