from db import *
from s3 import *

import requests

db: DB = DB()


def sim_aws_upload(path : str, fid: str):
    url = generate_upload_url(fid)
    requests.put(url, data=path)


def sim_student_upload(user : str, path : str):
    fid = db.create_file(user, FileRole.STUDENT_COPY, "{}")
    print("Generated fid:", fid)

    sim_aws_upload(path, fid)


    print(generate_download_url(fid))



sim_student_upload("admin", "/home/mitch/Documents/hack/HackOHIO25/src/backend/uploads/midterm 1 - calc iii.pdf")

    














