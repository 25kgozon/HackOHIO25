from db import *
from s3 import *

import requests

db: DB = DB()


def sim_aws_upload(path : str, fid: str):
    url = generate_upload_url(fid)
    requests.put(url, data=path)


def sim_student_upload(user : str, path : str):
    fid = db.create_file(user, FileRole.STUDENT_RESPONSE, "{}")
    print("Generated fid:", fid)

    sim_aws_upload(path, fid)


    print(generate_download_url(fid))

def sim_teacher_upload(user : str, path : str):
    fid = db.create_file(user, FileRole.TEACHER_KEY, "{}")
    print("Generated fid:", fid)

    sim_aws_upload(path, fid)


    print(generate_download_url(fid))




def sim_event_ocr(fid : str):
    db.enqueue_file_task(TaskType.OCR, [fid], "{}")





# Student: 0ffecf6f-4542-4eb1-9a47-b428102a08c9 
# Teacher: 29e46e27-f961-47ff-b250-215302be9633



# sim_student_upload("admin", "/home/mitch/Documents/hack/HackOHIO25/src/backend/uploads/midterm 1 - calc iii.pdf")
# sim_teacher_upload("admin", "/home/mitch/Documents/hack/HackOHIO25/src/backend/uploads/midterm1_solution.pdf")

sim_event_ocr("29e46e27-f961-47ff-b250-215302be9633")















