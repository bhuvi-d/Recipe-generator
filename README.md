# 🍴 RecGen – AI-Powered Recipe Generator

RecGen is a full-stack AI application that detects ingredients from an uploaded image using computer vision and generates structured recipes using a large language model.

---

## 🚀 Overview

RecGen combines **Computer Vision**, **Generative AI**, and **Cloud Deployment** into a production-ready full-stack system.

### Application Flow
1. User uploads an image.
2. YOLOv8 performs real-time ingredient detection.
3. Cohere generates 4 recipe title suggestions.
4. A structured step-by-step recipe is generated based on the selected title.
5. Results are dynamically rendered in the frontend.

---

## 🧠 Tech Stack

### Frontend
- React
- Tailwind CSS
- Axios
- Deployed on Vercel

### Backend
- FastAPI
- YOLOv8 (Ultralytics) for ingredient detection
- Cohere API for recipe generation
- Pillow for image processing
- Deployed on Render

---

## 🏗 Architecture

React Client  
→ FastAPI Backend  
→ YOLOv8 Inference  
→ Cohere LLM API  
→ Structured JSON Response  
→ UI Rendering  

---

## ✨ Key Features

- 📸 Real-time ingredient detection from images
- 🧠 AI-generated recipe suggestions
- 📝 Structured, formatted recipe generation
- 🌐 Fully deployed full-stack architecture (Vercel + Render)
- 🔄 End-to-end API integration

---


