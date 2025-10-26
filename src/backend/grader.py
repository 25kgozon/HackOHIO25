# grader.py
from openai import OpenAI
import os
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime

# Import the teacher cache from runner.py
try:
    from runner import TEACHER_CACHE
except ImportError:
    TEACHER_CACHE = {}

class AIGrader:
    def __init__(self):
        # Load API keys
        load_dotenv()
        self.teacher_key = os.getenv("teacher_file_api")
        self.student_key = os.getenv("student_file_api")
        self.grader_key = os.getenv("grader_api_key")

        self.teacher_client = OpenAI(api_key=self.teacher_key)
        self.student_client = OpenAI(api_key=self.student_key)
        self.grader_client = OpenAI(api_key=self.grader_key)

        # Local in-memory cache for teacher file uploads
        self.teacher_file_cache = {}

    @staticmethod
    def timestamp(msg=""):
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{now}] {msg}")

    def upload_teacher_file(self, path):
        if path in self.teacher_file_cache:
            self.timestamp(f"Teacher file cached locally, skipping upload: {path}")
            return self.teacher_file_cache[path]

        self.timestamp(f"Uploading teacher file: {path}")
        teacher_file = self.teacher_client.files.create(
            file=open(path, "rb"),
            purpose="user_data"
        )
        self.teacher_file_cache[path] = teacher_file.id
        self.timestamp(f"Teacher file uploaded: {path}")
        return teacher_file.id

    def read_teacher_files(self, teacher_file_path, context_file_paths=None):
        # Use runner.py cache first
        if teacher_file_path in TEACHER_CACHE:
            self.timestamp(f"Using cached teacher summary for: {teacher_file_path}")
            return TEACHER_CACHE[teacher_file_path]

        # Otherwise, upload and summarize
        teacher_file_id = self.upload_teacher_file(teacher_file_path)

        content = [
            {"type": "input_text", "text": "Summarize and extract key solutions from this exam key PDF."},
            {"type": "input_file", "file_id": teacher_file_id}
        ]

        if context_file_paths:
            for path in context_file_paths:
                self.timestamp(f"Uploading context file: {path}")
                context_file = self.teacher_client.files.create(
                    file=open(path, "rb"),
                    purpose="user_data"
                )
                content.append({"type": "input_file", "file_id": context_file.id})
            content.append({
                "type": "input_text",
                "text": "The above files provide additional context to guide grading decisions."
            })

        self.timestamp("Summarizing teacher files...")
        response = self.teacher_client.responses.create(
            model="gpt-5",
            input=[{"role": "user", "content": content}]
        )
        self.timestamp("Teacher file summary complete.")
        return response.output_text

    def read_student_file(self, student_file_path):
        self.timestamp(f"Uploading student file: {student_file_path}")
        student_file = self.student_client.files.create(
            file=open(student_file_path, "rb"),
            purpose="user_data"
        )
        self.timestamp("Student file uploaded, summarizing...")
        response = self.student_client.responses.create(
            model="gpt-5",
            input=[{
                "role": "user",
                "content": [
                    {"type": "input_text", "text": "Extract and summarize the student's responses from this exam PDF."},
                    {"type": "input_file", "file_id": student_file.id}
                ]
            }]
        )
        self.timestamp("Student file summary complete.")
        return response.output_text

    def grade_submission(self, teacher_file_path, student_file_path, context_file_paths=None, teacher_notes=None):
        start_time = datetime.now()
        self.timestamp("Grading started.")

        with ThreadPoolExecutor(max_workers=2) as executor:
            future_teacher = executor.submit(self.read_teacher_files, teacher_file_path, context_file_paths)
            future_student = executor.submit(self.read_student_file, student_file_path)

            teacher_text = future_teacher.result()
            student_text = future_student.result()

        grading_prompt = f"""
You are an expert grader.

Teacher Key:
{teacher_text}

Student Submission:
{student_text}
"""

        if teacher_notes:
            grading_prompt += f"\n\nAdditional Instructions:\n{teacher_notes}"

        self.timestamp("Sending grading prompt to AI...")
        response = self.grader_client.responses.create(
            model="gpt-5",
            input=[{"role": "user", "content": [{"type": "input_text", "text": grading_prompt}]}]
        )
        self.timestamp("Grading complete.")
        return response.output_text

# --- Local testing example ---
if __name__ == "__main__":
    grader = AIGrader()

    teacher_pdf = "/Users/kgozon/Documents/midterm1_solution.pdf"
    student_pdf = "/Users/kgozon/Documents/midterm 1 - calc iii.pdf"

    result = grader.grade_submission(
        teacher_file_path=teacher_pdf,
        student_file_path=student_pdf
    )

    print("\n📊 Final Grade Output:\n")
    print(result)
