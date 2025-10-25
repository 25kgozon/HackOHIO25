from openai import OpenAI
import os
from dotenv import load_dotenv

# --- Load API keys ---
load_dotenv()

teacher_key = os.getenv("teacher_file_api")
student_key = os.getenv("student_file_api")
grader_key = os.getenv("grader_api_key")

teacher_client = OpenAI(api_key=teacher_key)
student_client = OpenAI(api_key=student_key)
grader_client = OpenAI(api_key=grader_key)

# --- Step 1: Teacher file ---
print("Uploading and reading teacher file...")
teacher_file = teacher_client.files.create(
    file=open("/Users/kgozon/Documents/midterm1_solution.pdf", "rb"),
    purpose="user_data"
)

teacher_response = teacher_client.responses.create(
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
teacher_text = teacher_response.output_text
print("✅ Teacher file processed.\n")

# --- Step 2: Student file ---
print("Uploading and reading student file...")
student_file = student_client.files.create(
    file=open("/Users/kgozon/Documents/midterm 1 - calc iii.pdf", "rb"),
    purpose="user_data"
)

student_response = student_client.responses.create(
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
student_text = student_response.output_text
print("✅ Student file processed.\n")

# --- Step 3: Grading ---
grading_prompt = f"""
You are an expert Calculus III grader.
Use the following exam key and student answers to grade the work fairly according to the detailed rubric.

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


grading_response = grader_client.responses.create(
    model="gpt-5",
    input=[
        {"role": "user", "content": [{"type": "input_text", "text": grading_prompt}]}
    ],
)



print("📊 Final Grade Output:\n")
print(grading_response.output_text)
