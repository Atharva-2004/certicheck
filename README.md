![codetoflow (1)](https://github.com/user-attachments/assets/b09ff496-8cb0-43d6-965b-74a3d50379c0)# 🛡️ CertiCheck - Smart Document Verification Platform

CertiCheck is an AI-powered, modular document verification system designed to automate identity and academic document validation, tailored specifically for Indian government-issued documents. It combines OCR, Vision-Language models (Together AI), and intelligent regex/NLP pipelines to extract structured data and validate documents like Aadhaar cards, PAN cards, GATE scorecards, academic mark sheets, and resumes.

---

## 📌 Table of Contents

- [🛠️ Project Setup](#️-project-setup)
- [⚙️ CI/CT/CD Pipeline](#️-cictcd-pipeline)
- [🐳 Docker & Deployment](#-docker--deployment)
- [🧪 Sample Test Output](#-sample-test-output)
- [👥 Team & Responsibilities](#-team--responsibilities)


---

## 🛠️ Project Setup

### 🔧 Tech Stack

| Component   | Tech                         |
|-------------|------------------------------|
| Frontend    | React + Vite + TailwindCSS   |
| Backend     | Django Rest Framework (DRF)  |
| OCR         | Together AI's LLaMA Vision-Free |
| Storage     | Cloudinary                   |
| Database    | PostgreSQL (Aiven)           |
| Container   | Docker                       |
| CI/CD       | Jenkins                      |
| Testing     | PyTest (Backend) / Vitest (Frontend) |

### 📂 Folder Structure
certicheck/
            ├── certireact/ # React Frontend 
            ├── certidrf/ # Django Backend 
            ├── docker-compose.yml 
            └── Jenkinsfile

### 🚀 Setup Instructions

1. **Clone Repository**
```bash
git clone https://github.com/Atharva-2004/certicheck.git
cd certicheck
```
2.Run via Docker Compose
```bash
docker-compose up --build
```
3.Access App
Frontend: http://localhost:3000
Backend API: http://localhost:8000/api/

⚙️ CI/CT/CD Pipeline
![codetoflow (1)](https://github.com/user-attachments/assets/e66352f3-ab4d-4418-9a16-99d59c17073b)


🐳 Docker & Deployment
🔨 Build Images
```bash
docker build -t certicheck-frontend ./certireact
docker build -t certicheck-backend ./certidrf
```
🚀 Push to DockerHub
```bash
docker tag certicheck-frontend your-dockerhub-username/certicheck-frontend
docker push your-dockerhub-username/certicheck-frontend

docker tag certicheck-backend your-dockerhub-username/certicheck-backend
docker push your-dockerhub-username/certicheck-backend
```
🖥️ Deploy via Compose
```bash
docker-compose up -d --build
```
🪝 Jenkins Secrets Used
Each credential (DB, Cloudinary, API keys) is stored securely in Jenkins and written to .env files dynamically before the build.

![image](https://github.com/user-attachments/assets/ca669963-7f9a-4927-90c2-43e359b46af2)
![image](https://github.com/user-attachments/assets/6b282987-801d-40e3-a7ac-013882970d6f)
![image](https://github.com/user-attachments/assets/24c0a7b1-f6c1-4572-9612-361918d6ebe5)


👥 Team & Responsibilities

Name	              Roll No	              Contribution
Atharva Ajagekar	 22101B0003	 Backend API, Jenkins
Sahil Sakpal       22101B0008	 OCR Integration, Docker
Tejas Shinde	     22101B0014	 CI/CD Pipeline, Frontend Vite + Docker



