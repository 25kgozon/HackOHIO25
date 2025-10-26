from dotenv import load_dotenv

import os
load_dotenv()





from db import *
from s3 import *

import requests

db: DB = DB()


#db.create_assignment(UUID("4bc332b9-bbea-4e53-a0e7-89bd2084eb0b"), "foo ass", "desc", {}, "")
print(db.get_class_assignments(UUID("4bc332b9-bbea-4e53-a0e7-89bd2084eb0b")))
