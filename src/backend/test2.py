from dotenv import load_dotenv

import os
load_dotenv()


from uuid import UUID


from db import *
from s3 import *

import requests

db: DB = DB()


# print(db.create_assignment(UUID("3829cf32-2a91-4eeb-a7f7-68a622d485f7"), "foo ass", "desc", {}, {}, ""))
# print(db.get_class_assignments(UUID("3829cf32-2a91-4eeb-a7f7-68a622d485f7")))


db.enqueue_text_task(TaskType.SUMMARIZE, [], [UUID("242f668d-8556-40b7-a0a6-7bb7a4bbc053")], "")


