from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
import cohere

# --------------------------
# Cohere setup
# --------------------------
COHERE_KEY = "ppQD0sLweewYd2UcuBMhSK01ejaZL5yGAdHHDqZm"
co = cohere.ClientV2(COHERE_KEY)

# --------------------------
# FastAPI setup
# --------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLO model (replace with food-specific model if you have one)
model = YOLO("yolov8s.pt")

# --------------------------
# Helper function to generate recipe
# --------------------------
def generate_recipe(ingredients):
    prompt = f"Generate a detailed recipe with steps using these ingredients: {', '.join(ingredients)}"
    try:
        chat_response = co.chat(
            model="command-a-03-2025",
            messages=[{"role": "user", "content": prompt}]
        )
        # Extract text safely
        recipe_text = chat_response.message.content[0].text
        return recipe_text
    except Exception as e:
        print("Error generating recipe:", e)
        return None

# --------------------------
# Main endpoint
# --------------------------
@app.post("/detect-and-retrieve")
async def detect_and_retrieve(image: UploadFile = File(...)):
    # Read uploaded image
    img_bytes = await image.read()
    img = Image.open(io.BytesIO(img_bytes))

    # Run YOLO detection
    results = model.predict(img, conf=0.4)

    # Extract detected ingredients
    detected_ingredients = set()
    for box in results[0].boxes:
        cls_id = int(box.cls[0])
        label = results[0].names[cls_id]
        detected_ingredients.add(label)
    detected_ingredients = list(detected_ingredients)

    if not detected_ingredients:
        return {"error": "No ingredients detected"}

    # Generate recipe using Cohere V2 Chat
    recipe_text = generate_recipe(detected_ingredients)
    if not recipe_text:
        return {"error": "Failed to generate recipe"}

    # Return results
    return {
        "detected": detected_ingredients,
        "recipe": recipe_text
    }
