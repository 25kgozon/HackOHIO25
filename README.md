# 📚 GrAIdscope — Gradescope Reimagined: An AI-Powered Grading System

![GrAIdscope Banner](images/logo.png)

---

## 🚀 Project Overview
GrAIdscope is a **revolutionary AI-powered grading platform** designed to transform the way educators assess student work.  

In today’s fast-paced educational environment:  
- Teachers are overwhelmed by grading large volumes of exams.  
- Students often wait weeks for meaningful feedback.  

GrAIdscope **automates free-response exam evaluation** with speed and precision:  
1. Teachers upload their answer key PDF.  
2. Students submit completed exams.  
3. AI compares submissions against the key and produces **comprehensive grades** and **detailed, actionable feedback**—all within minutes.  

💡 Benefits:  
- **Consistency:** Eliminates human error and subjective bias.  
- **Efficiency:** Reduces grading time from weeks to minutes.  
- **Learning:** Students receive immediate, transparent feedback.  

For investors, GrAIdscope represents a **cutting-edge opportunity at the intersection of AI, EdTech, and workflow automation**.

---

## 💡 Inspiration
We identified major issues with OSU’s current grading platform, Gradescope:  
- ⏳ **Slow:** Manual grading in big classes takes 2+ weeks.  
- ⚠️ **Unreliable:** Reports of lost student tests, missing grades, and software glitches.  

We researched other solutions, compared their features, and designed a system that **combines AI efficiency with reliability and accessibility**.  

---

## 🧩 Features

| Feature | Description |
|---------|-------------|
| **Teacher Upload** | Teachers upload the exam answer key PDF. |
| **Student Submission** | Students upload completed exam PDFs. |
| **AI Grading** | Compares student answers with teacher key and produces: <br>• Detailed scoring breakdowns (Completeness, Correctness, Simplification/Presentation) <br>• Overall exam score <br>• Feedback comments per question |
| **Secure & Fast** | Uses API keys and backend processing to handle multiple submissions efficiently. |
| **User-Friendly Frontend** | Intuitive interface for uploading files and viewing results. |

---

## 🛠 Design Process

<details>
<summary>Click to expand the design process</summary>

### Gap Identification
- Existing graders fail at handling handwritten text.  
- Many AI grading tools have a steep learning curve for teachers.

### Experimental Exploration
- Tested multiple OCR engines, AI scoring logic, and dataset preprocessing.  
- Brainstormed intuitive UI layout for students and teachers.  

### Implementation Actions
- Integrated OpenAI GPT-5 API for semantic grading.  
- Used Amazon S3 for scalable file storage.  
- React + Vite frontend for responsiveness.  
- Google OAuth for authentication.  
- Flask + PostgreSQL backend with NGINX deployment.  

**Outcome:** Improved usability, data flow, OCR precision, and AI grading accuracy.
</details>

---

## 📊 Metrics
- ⚡ **Grading Speed:** Reduced midterm grading from 2 weeks to minutes.  
- 🎯 **Accuracy:** AI scores closely match human graders with detailed explanations.  
- 📈 **Scalability:** Handles hundreds of submissions concurrently.

![Screenshot](images/graiscope.png)

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

## 🏁 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/25kgozon/HackOHIO25.git
cd HackOHIO25
