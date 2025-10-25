from db import *
from concurrent.futures import ThreadPoolExecutor, Future
import traceback
import time
import subprocess

WORKERS = 1


def runner(payload : dict):
    p = subprocess.Popen(payload.get("cmd", "echo INVALID CMD"), shell=True, stderr=subprocess.PIPE, stdout=subprocess.PIPE)

    code = p.wait()


    print("Completed task!")
    return {
        "code": code,
        "stdout": p.stdout.read().decode("utf-8"),
        "stderr": p.stderr.read().decode("utf-8"),
    }
        


def main():
    db : DB = DB()
    running : list[tuple[int, Future]] = []

    print("Starting event runner")

    with ThreadPoolExecutor(max_workers=WORKERS) as exec:
        while True:
            doSleep = True
            completed = [fut for fut in running if fut[1].done()]
            for idd, complete in completed:
                exception = complete.exception()
                doSleep = False
                if exception is not None:
                    traceback.print_exception(exception)
                    db.complete_event(idd, {"status": "error"})
                    continue


                r = complete.result()
                db.complete_event(idd, {"status": "ok", "result": r})
            running = [fut for fut in running if not fut[1].done()]
        
            if WORKERS > len(running):
                event = db.dequeue_event()
                if event is not None:
                    doSleep = False
                    idd, payload = event
                    running.append((idd, exec.submit(runner, payload)))
                



            if doSleep:
                time.sleep(0.5)
                





if __name__ == "__main__":
    main()




