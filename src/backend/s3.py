import boto3, os

s3 = boto3.client(
    "s3",
    region_name="us-east-1",
    aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
)


BUCKET = "pdf-stasher"



def generate_download_url(key, expiry_seconds=3600):
    return s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": BUCKET, "Key": key},
        ExpiresIn=expiry_seconds,
    )

def generate_upload_url(key, expiry_seconds=3600):

    return s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={"Bucket": BUCKET, "Key": key},
        ExpiresIn=expiry_seconds,
    )


    

def download_by_key(key, destination_path):
    """
    Downloads a file from S3 using the specified key and writes it
    to the given local destination path.
    """
    s3.download_file(BUCKET, key, destination_path)
    return destination_path
