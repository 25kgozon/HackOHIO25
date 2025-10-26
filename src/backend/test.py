from dotenv import load_dotenv

import os
load_dotenv()





from db import *
from s3 import *

import requests

db: DB = DB()


def sim_aws_upload(path : str, fid: str):
    url = generate_upload_url(fid)
    requests.put(url, data=open(path, "rb"))



def sim_student_upload(user : str, path : str):
    fid = db.create_file(user, os.path.basename(path), FileRole.STUDENT_RESPONSE, "{}")
    print("Generated fid:", fid)

    sim_aws_upload(path, fid)


    print(generate_download_url(fid))

def sim_teacher_upload(user : str, path : str):
    fid = db.create_file(user, os.path.basename(path), FileRole.TEACHER_KEY, "{}")
    print("Generated fid:", fid)

    sim_aws_upload(path, fid)


    print(generate_download_url(fid))




def sim_event_ocr(fid : str):
    db.enqueue_file_task(TaskType.OCR, [fid], "{}")





# student: 242f668d-8556-40b7-a0a6-7bb7a4bbc053 
#teacher: 



# sim_student_upload("admin", "/home/mitch/Documents/hack/HackOHIO25/src/backend/uploads/midterm 1 - calc iii.pdf")
# sim_teacher_upload("admin", "/home/mitch/Documents/hack/HackOHIO25/src/backend/uploads/midterm1_solution.pdf")

# sim_event_ocr("242f668d-8556-40b7-a0a6-7bb7a4bbc053")
file_cache = (db.get_file_cache("242f668d-8556-40b7-a0a6-7bb7a4bbc053"))


# print(generate_download_url("9f16967b-f48e-4e44-a682-fbf32fc5f6c7"))


# Get the file info
file_id = "242f668d-8556-40b7-a0a6-7bb7a4bbc053"
file_info = db.get_file(file_id)

if file_info and file_info["posted_user"]:
    # Get the actual user who posted the file
    openid = file_info["posted_user"]

    # Get all classes for this user
    user_classes = db.get_user_classes(openid)

    if user_classes:
        # Grab the first class (or you could loop through all)
        class_name = user_classes[0]["name"]

        # Print the class name
        print("Class Name:", class_name)

        # Enqueue the summarization task using the class name dynamically
        file_cache = db.get_file_cache(file_id)
        db.enqueue_text_task(TaskType.SUMMARIZE, [file_cache], {"subject": class_name})
    else:
        print("No classes found for this user.")
else:
    print("File not found or no user associated with file.")


file_id = "242f668d-8556-40b7-a0a6-7bb7a4bbc053"
file_info = db.get_file(file_id)
print(file_info)
print(openid)





















