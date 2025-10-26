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

Exam Key:
{teacher_text}

Student Submission:
{student_text}

Instructions for Grading:
1. Grade each question independently using the following criteria:
   - Completeness: Check if the student answered all parts of the question. Award partial credit for incomplete but valid work.
   - Correctness: Verify if the student’s solution is mathematically, scientifically, or conceptually correct. Deduct points for errors, but give partial credit for partially correct reasoning or steps.
   - Simplification/Presentation: Evaluate clarity, organization, and whether the answer is simplified or neatly presented.

2. Use step-by-step reasoning for each question. Explain how you arrived at each score, highlighting mistakes, misconceptions, or missing components.

3. Provide a detailed scoring breakdown for each question in a table format showing:
   - Points possible
   - Points awarded
   - Reasoning for deductions

4. Include an overall feedback summary at the end:
   - Strengths demonstrated by the student
   - Areas for improvement
   - Overall score and grade

5. Formatting requirements:
   - Use clear headings for each question (e.g., Question 1, Question 2).
   - Include subheadings for Completeness, Correctness, Simplification/Presentation, and Comments.
   - Provide reasoning that a human instructor would understand.
   - Use bullet points or tables when appropriate to clearly show scoring.

6. Important:
   - Never skip grading a question.
   - Award partial credit where appropriate.
   - Be fair, objective, and professional.
   - Provide constructive feedback that the student can learn from.

Output Example:

Question 1:
Completeness: 8/10 - Student answered all parts but missed step 3.
Correctness: 7/10 - Minor calculation errors in step 2.
Simplification/Presentation: 4/5 - Clear and organized, slight formatting issues.
Comments: Overall good attempt; review step 2 calculations.

Question 2:
...

Overall Feedback:
- Strengths: Solid understanding of concepts, clear explanations.
- Areas for Improvement: Double-check calculations, pay attention to formatting.
- Summary Score: 35/40

Grade the work as a senior instructor with decades of experience. 
Provide detailed, stepwise, accurate scoring with partial credit wherever justified.
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