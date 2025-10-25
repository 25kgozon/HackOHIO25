import boto3, os
s3 = boto3.client("s3")


s3_client = boto3.client(
    "s3",
    region_name="us-east-2",
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
)
