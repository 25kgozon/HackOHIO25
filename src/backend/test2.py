from dotenv import load_dotenv

import os
load_dotenv()


from uuid import UUID


from db import *
from s3 import *

import requests

db: DB = DB()
def sim_aws_upload(path: str, fid: str):
    """
    Uploads a local file to S3 using a presigned URL.
    """
    url = generate_upload_url(fid)
    with open(path, "rb") as f:
        requests.put(url, data=f)
    print(f" Uploaded {path} to S3 with file id {fid}")

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



# print(db.create_assignment(UUID("3829cf32-2a91-4eeb-a7f7-68a622d485f7"), "foo ass", "desc", {}, {}, ""))
# print(db.get_class_assignments(UUID("3829cf32-2a91-4eeb-a7f7-68a622d485f7")))
if __name__ == "__main__":
    # Replace with your actual paths
    teacher_pdf = "/Users/kgozon/HackOHIO25/src/backend/uploads/midterm 1 - calc iii.pdf"
    student_pdf = "/Users/kgozon/HackOHIO25/src/backend/uploads/midterm1_solution.pdf"

    user = "admin"

    # STEP 1: Upload both teacher and student files
    teacher_fid = sim_teacher_upload(user, teacher_pdf)
    student_fid = sim_student_upload(user, student_pdf)

    sim_ocr_task(teacher_fid)
    sim_ocr_task(student_fid)


    #db.enqueue_text_task(TaskType.SUMMARIZE, [], [UUID(teacher_fid)], "")
    #db.enqueue_text_task(TaskType.SUMMARIZE, [], [UUID(student_fid)], "")



