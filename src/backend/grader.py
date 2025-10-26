# grader.py
from openai import OpenAI
import os
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor
from db import *
#TODO instead of taking paths, take in raw text of everything (from db)
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

        # Simple in-memory cache for teacher file uploads
        self.teacher_file_cache = {}

    def upload_teacher_file(self, path):
        """
        Uploads teacher file if not already cached.
        Returns OpenAI file ID.
        """
        if path in self.teacher_file_cache:
            return self.teacher_file_cache[path]

        teacher_file = self.teacher_client.files.create(
            file=open(path, "rb"),
            purpose="user_data"
        )
        self.teacher_file_cache[path] = teacher_file.id
        return teacher_file.id

    def read_teacher_files(self, teacher_file_path, context_file_paths=None):
        """
        Prepare teacher content using cached upload IDs.
        """
        teacher_file_id = self.upload_teacher_file(teacher_file_path)

        content = [
            {"type": "input_text", "text": "Summarize and extract key solutions from this exam key PDF."},
            {"type": "input_file", "file_id": teacher_file_id}
        ]

        # Include context files if provided
        if context_file_paths:
            for path in context_file_paths:
                context_file = self.teacher_client.files.create(
                    file=open(path, "rb"),
                    purpose="user_data"
                )
                content.append({"type": "input_file", "file_id": context_file.id})
            content.append({
                "type": "input_text",
                "text": "The above files provide additional context to guide grading decisions."
            })

        response = self.teacher_client.responses.create(
            model="gpt-5",
            input=[{"role": "user", "content": content}]
        )

        return response.output_text

    def read_student_file(self, student_file_path):
        """
        Upload and summarize the student's submission.
        """
        student_file = self.student_client.files.create(
            file=open(student_file_path, "rb"),
            purpose="user_data"
        )
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
        return response.output_text

    def grade_submission(self, teacher_file_path, student_file_path, context_file_paths=None, teacher_notes=None):
        """
        Main grading function. Upload teacher and student files in parallel.
        """
        with ThreadPoolExecutor(max_workers=2) as executor:
            future_teacher = executor.submit(self.read_teacher_files, teacher_file_path, context_file_paths)
            future_student = executor.submit(self.read_student_file, student_file_path)

            teacher_text = future_teacher.result()
            student_text = future_student.result()

        grading_prompt = f"""
        You are an expert Calculus III grader.
        Use the following exam key, optional reference materials, and student answers
        to grade the work fairly according to the detailed rubric.

        Exam Key and Context:
        {teacher_text}

        Student Submission:
        {student_text}
        """

        if teacher_notes:
            grading_prompt += f"\n\nTeacher's Additional Grading Instructions:\n{teacher_notes}\n"

        grading_prompt += """
        Grade each question with detailed scoring breakdowns for:
        - Completeness
        - Correctness
        - Simplification/Presentation
        End with an overall feedback summary.
        """

        response = self.grader_client.responses.create(
            model="gpt-5",
            input=[{"role": "user", "content": [{"type": "input_text", "text": grading_prompt}]}]
        )

        return response.output_text


# --- Local testing example ---
if __name__ == "__main__":
    grader = AIGrader()
    teacher_pdf = "/Users/kgozon/Documents/midterm1_solution.pdf"
    student_pdf = "/Users/kgozon/Documents/midterm 1 - calc iii.pdf"

    use_context = input("Do you want to include context files? (y/n): ").strip().lower()
    context_files = []
    if use_context == "y":
        context_input = input("Enter file paths separated by commas: ").strip()
        context_files = [path.strip() for path in context_input.split(",") if path.strip()]

    teacher_notes = input("Enter any special grading instructions (optional): ").strip()
    teacher_notes = teacher_notes if teacher_notes else None

    result = grader.grade_submission(
        teacher_file_path=teacher_pdf,
        student_file_path=student_pdf,
        context_file_paths=context_files if context_files else None,
        teacher_notes=teacher_notes
    )

    print("\n📊 Final Grade Output:\n")
    print(result)
