from openai import OpenAI
import os
from dotenv import load_dotenv
import db

class AIGrader:
    def __init__(self):
        # Load API keys from .env
        load_dotenv()
        self.teacher_key = os.getenv("teacher_file_api")
        self.student_key = os.getenv("student_file_api")
        self.grader_key = os.getenv("grader_api_key")

        # Initialize OpenAI clients
        self.teacher_client = OpenAI(api_key=self.teacher_key)
        self.student_client = OpenAI(api_key=self.student_key)
        self.grader_client = OpenAI(api_key=self.grader_key)

    def read_teacher_file(self, file_path: str) -> str:
        """Upload and process the teacher's answer key PDF."""
        print("Uploading and reading teacher file...")
        teacher_file = self.teacher_client.files.create(
            file=open(file_path, "rb"),
            purpose="user_data"
        )
        teacher_response = self.teacher_client.responses.create(
            model="gpt-5",
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": "Summarize and extract the key solutions and answers from this exam key PDF."},
                        {"type": "input_file", "file_id": teacher_file.id},
                    ],
                }
            ],
        )
        print("Teacher file processed.\n")
        return teacher_response.output_text

    def read_student_file(self, file_path: str) -> str:
        """Upload and process the student's exam submission PDF."""
        print("Uploading and reading student file...")
        student_file = self.student_client.files.create(
            file=open(file_path, "rb"),
            purpose="user_data"
        )
        student_response = self.student_client.responses.create(
            model="gpt-5",
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": "Extract and summarize the student's responses from this exam submission PDF."},
                        {"type": "input_file", "file_id": student_file.id},
                    ],
                }
            ],
        )
        print("✅ Student file processed.\n")
        return student_response.output_text

    def grade_submission(self, teacher_text: str, student_text: str) -> str:
        """Grade the student's submission based on the teacher's answer key."""
        grading_prompt = f"""
You are an expert grader in the subject covered by this exam, with 20 years of experience grading midterms at the highest academic level. 
Your goal is to replace teachers in providing fast, fair, and highly accurate grading.
Use the following exam key and student answers to grade the work according to a detailed, fair, and rigorous rubric.
Exam Key:
{teacher_text}
Student Submission:
{student_text}
Instructions:
Grade each question independently, focusing on the following categories:
Completeness: Did the student attempt all parts of the question? Are all required steps or components present?
Correctness: Are the answers mathematically, scientifically, or conceptually correct? Highlight any mistakes or misconceptions.
Simplification/Presentation: Is the work presented clearly? Are the answers simplified, neatly organized, and easy to follow?
Provide a detailed scoring breakdown for each question in a table format, showing points awarded and reasoning for deductions.
Include a concise overall feedback summary at the end, mentioning strengths, areas for improvement, and any patterns in the student’s work.
Ensure your feedback is professional, constructive, and actionable. Use clear language that a student can understand, and do not leave any question ungraded.
        



Exam Key:
{teacher_text}

Student Submission:
{student_text}

Now grade each question with detailed scoring breakdowns for:
- Completeness
- Correctness
- Simplification/Presentation
And give a short overall feedback summary at the end.
"""
        print("🧮 Grading now...")
        grading_response = self.grader_client.responses.create(
            model="gpt-5",
            input=[
                {"role": "user", "content": [{"type": "input_text", "text": grading_prompt}]}
            ],
        )
        return grading_response.output_text


if __name__ == "__main__":
    grader = AIGrader()

    # Paths to files
    teacher_file_path = "/Users/kgozon/Documents/midterm1_solution.pdf"
    student_file_path = "/Users/kgozon/Documents/midterm 1 - calc iii.pdf"

    # Process files
    teacher_text = grader.read_teacher_file(teacher_file_path)
    student_text = grader.read_student_file(student_file_path)

    # Grade submission
    final_grade = grader.grade_submission(teacher_text, student_text)
    print("📊 Final Grade Output:\n")
    print(final_grade)