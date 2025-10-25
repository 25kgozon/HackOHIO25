import boto3
from botocore.config import Config


BUCKET = "pdf-stasher"

def generate_presigned_urls(bucket_name, key, expiry_seconds=3600):
    s3 = boto3.client("s3", config=Config(signature_version="s3v4"))

    upload_url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={"Bucket": bucket_name, "Key": key},
        ExpiresIn=expiry_seconds,
    )

    download_url = s3.generate_presigned_url(
        ClientMethod="get_object",
        Params={"Bucket": bucket_name, "Key": key},
        ExpiresIn=expiry_seconds,
    )

    return {"upload_url": upload_url, "download_url": download_url}


if __name__ == "__main__":
    urls = generate_presigned_urls(BUCKET, "test.txt")
    print(urls)
