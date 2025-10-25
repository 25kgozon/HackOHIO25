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

#seprateee teacher ocr, student ocr, and combined from both ocrs

def runner(payload: dict):
    """
    Runs a grading job.
    payload should contain:
    {
        "teacher_path": "uploads/teacher.pdf",
        "student_path": "uploads/student.pdf",
        "context_paths": ["uploads/context1.pdf", ...],  # optional
        "grading_spec": "Focus on partial credit",
        "course": "calc_iii"
    }
    """
    try:
        grader = AIGrader()

        teacher_path = payload.get("teacher_path")
        student_path = payload.get("student_path")
        context_paths = payload.get("context_paths", [])
        grading_spec = payload.get("grading_spec", "")
        course = payload.get("course", "general")

        # Run the grader
        grade_output = grader.grade_submission(
            teacher_path,
            student_path,
            context_paths=context_paths,
            grading_spec=grading_spec,
            course=course
        )

        # Save results to file
        os.makedirs("results", exist_ok=True)
        results_path = os.path.join("results", f"result_{int(time.time())}.txt")
        with open(results_path, "w") as f:
            f.write(grade_output)

        return {"status": "ok", "results_path": results_path}

    except Exception as e:
        traceback.print_exc()
        return {"status": "error", "error": str(e)}

def main():
    db: DB = DB()
    running: list[tuple[int, Future]] = []

    print("🚀 Starting event runner")

    with ThreadPoolExecutor(max_workers=WORKERS) as exec:
        #while True:
            doSleep = True

            # Check completed jobs
            completed = [fut for fut in running if fut[1].done()]
            for idd, complete in completed:
                exception = complete.exception()
                doSleep = False
                if exception:
                    traceback.print_exception(exception)
                    db.complete_event(idd, {"status": "error"})
                    continue

                result = complete.result()
                db.complete_event(idd, {"status": result.get("status"), "result": result})
            running = [fut for fut in running if not fut[1].done()]

            # Dequeue new jobs if there is capacity

            if WORKERS > len(running):
                event = db.dequeue_event()
                if event:
                    doSleep = False
                    idd, payload = event
                    print(f"🧾 Starting new job ID {idd}")
                    running.append((idd, exec.submit(runner, payload)))

            if doSleep:
                time.sleep(0.5)

if __name__ == "__main__":
    main()
