# runner.py
from db import *
from concurrent.futures import ThreadPoolExecutor, Future
import traceback
import time
import os
try:
    from grader import AIGrader
except ImportError:
    from .grader import AIGrader

WORKERS = 1





def run_file_event(id : int, task_type : int, prompt_info : dict, files : list[str]):
    print(id, task_type, prompt_info, files)

def main():
    db: DB = DB()
    # Todo: Make list
    running: Future

    print("🚀 Starting event runner")

    with ThreadPoolExecutor(max_workers=WORKERS) as exec:
        event = db.dequeue_file_task()
        if event is not None:
            running = exec.submit(run_file_event, **event)
        else:
            print("No task")
            return
        while running.running():
            time.sleep(1)
        if running.exception():
            traceback.print_exception(running.exception())
    

    





if __name__ == "__main__":
    main()
