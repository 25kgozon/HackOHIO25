from dotenv import load_dotenv
import os
import requests
from db import *
from s3 import *

# Load environment variables
load_dotenv()

db = DB()


def sim_aws_upload(path: str, fid: str):
    """
    Uploads a local file to S3 using a presigned URL.
    """
    url = generate_upload_url(fid)
    with open(path, "rb") as f:
        requests.put(url, data=f)
    print(f"✅ Uploaded {path} to S3 with file id {fid}")


def sim_teacher_upload(user: str, path: str):
    """
    Simulates a teacher uploading a PDF to the system.
    """
    fid = db.create_file(user, os.path.basename(path), FileRole.TEACHER_KEY, "{}")
    sim_aws_upload(path, fid)
    print("Teacher file ID:", fid)
    print("Download URL:", generate_download_url(fid))
    return fid


def sim_student_upload(user: str, path: str):
    """
    Simulates a student uploading a PDF to the system.
    """
    fid = db.create_file(user, os.path.basename(path), FileRole.STUDENT_RESPONSE, "{}")
    sim_aws_upload(path, fid)
    print("Student file ID:", fid)
    print("Download URL:", generate_download_url(fid))
    return fid


def sim_ocr_task(fid: str):
    """
    Enqueue an OCR task so runner.py can process it into text.
    """
    db.enqueue_file_task(TaskType.OCR, [fid], "{}")
    print(f"📤 Enqueued OCR task for {fid}")


def sim_grading_task(student_fid: str, teacher_fid: str):
    """
    After OCR finishes, enqueue a text grading task.
    """
    db.enqueue_text_task(TaskType.SUMMARIZE, [student_fid, teacher_fid], "{}")
    print(f"📤 Enqueued grading task with student {student_fid} and teacher {teacher_fid}")


# ======== TEST PIPELINE ========

if __name__ == "__main__":
    # Replace with your actual paths
    teacher_pdf = "/Users/kgozon/Documents/midterm1_solution.pdf"
    student_pdf = "/Users/kgozon/Documents/midterm1_submission.pdf"

    user = "admin"

    # STEP 1: Upload both teacher and student files
    teacher_fid = sim_teacher_upload(user, teacher_pdf)
    student_fid = sim_student_upload(user, student_pdf)

    # STEP 2: Queue OCR events for both
    sim_ocr_task(teacher_fid)
    sim_ocr_task(student_fid)

    print("\n OCR tasks queued. Now run:")
    print("   python runner.py")
    print("to process both files and cache their text.\n")

    # STEP 3: Once OCR tasks complete (you’ll see in runner output),
    # enqueue the grading task:
    print("After OCR finishes, run this command:")
    print(f"   db.enqueue_text_task(TaskType.SUMMARIZE, ['{student_fid}', '{teacher_fid}'], '{{}}')")





















