# main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ultralytics import YOLO
from PIL import Image
import io
import cohere

COHERE_KEY = "ppQD0sLweewYd2UcuBMhSK01ejaZL5yGAdHHDqZm"
co = cohere.ClientV2(COHERE_KEY)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://recipe-generator-mu-sandy.vercel.app/"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO("yolov8s.pt")

def llm_suggestions(ings):
    prompt = (
        f"Given these ingredients: {', '.join(ings)}\n"
        "Propose exactly 4 distinct, appetizing recipe titles that realistically use them. "
        "Return only a plain numbered list of titles, one per line."
    )
    r = co.chat(model="command-a-03-2025", messages=[{"role": "user", "content": prompt}])
    text = r.message.content[0].text.strip()
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    titles = []
    for l in lines:
        if ". " in l:
            titles.append(l.split(". ", 1)[1].strip())
        else:
            titles.append(l.lstrip("1234.- ").strip())
    return titles[:4]

def llm_recipe(name, ings):
    prompt = (
        f"Create a clean, human-friendly recipe for '{name}' using these ingredients: {', '.join(ings)}.\n"
        "Return in this format without markdown hashes or asterisks:\n"
        "Title: <title>\n\n"
        "Ingredients:\n- item\n- item\n\n"
        "Instructions:\nStep 1: ...\nStep 2: ...\n"
    )
    r = co.chat(model="command-a-03-2025", messages=[{"role": "user", "content": prompt}])
    return r.message.content[0].text.strip()

@app.post("/detect-and-suggest")
async def detect_and_suggest(image: UploadFile = File(...)):
    img_bytes = await image.read()
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    res = model.predict(img, conf=0.4)
    detected = set()
    for box in res[0].boxes:
        cls_id = int(box.cls[0])
        label = res[0].names[cls_id]
        detected.add(label)
    detected = list(detected)
    if not detected:
        return {"detected": [], "suggestions": []}
    try:
        suggestions = llm_suggestions(detected)
    except Exception:
        suggestions = []
    return {"detected": detected, "suggestions": suggestions}

class GenerateBody(BaseModel):
    recipe_name: str
    ingredients: list[str]

@app.post("/generate-recipe")
async def generate_recipe(body: GenerateBody):
    try:
        recipe_text = llm_recipe(body.recipe_name, body.ingredients)
        return {"recipe": recipe_text}
    except Exception:
        return {"recipe": ""}
