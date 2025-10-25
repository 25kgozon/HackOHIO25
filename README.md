# 📚 Gradescope Reimagined: AI-Powered Grading System

**Project Overview**  
Gradescope Reimagined is an AI-driven grading platform that automates the evaluation of free-response exams. Teachers upload an answer key PDF, students submit their completed exams, and AI compares the two to generate detailed grades and feedback.

---

## 🧩 Features

- **Teacher Upload:** Teachers upload the answer key PDF for any exam.  
- **Student Submission:** Students upload their completed exam PDFs.  
- **AI Grading:** Automatically compares student answers with the teacher's key and produces:
  - Detailed scoring breakdowns (Completeness, Correctness, Simplification/Presentation)  
  - Overall exam score  
  - Feedback comments for each question  
- **Secure & Fast:** Uses API keys and efficient backend processing to handle multiple submissions.  
- **User-Friendly Frontend:** Intuitive interface for uploading files and viewing results.

---

## 🛠 Technology Stack

### Backend
- **Web Server:** NGINX  
- **Cloud Storage:** Amazon S3  
- **Web Framework:** Flask  
- **Database:** PostgreSQL  
- **AI/ML Integration:** OpenAI GPT-5 API  

### Frontend
- **Frameworks/Libraries:** React, Vite  
- **Languages:** HTML, CSS, JavaScript  

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/gradescope-reimagined.git
cd gradescope-reimagined
