import os
import io
import base64
import traceback
import re
from typing import Optional

from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image

import torch
from transformers import AutoProcessor, Qwen2VLForConditionalGeneration, logging as hf_logging
from peft import PeftModel

# --------------------------------------------------------
# PATHS — FINAL & CORRECT (RELATIVE TO flask/)
# --------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

LORA_PATH = os.path.join(
    BASE_DIR,
    "qwen2vl_grpo_lora_improved_hybrid_fixed"
)

BASE_MODEL_NAME = "Qwen/Qwen2-VL-2B-Instruct"

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
hf_logging.set_verbosity_error()

# --------------------------------------------------------
# FLASK APP
# --------------------------------------------------------

app = Flask(__name__)
CORS(app)

processor = None
model = None
MODEL_LOADED = False

# --------------------------------------------------------
# DEBUG: VERIFY LORA PATH
# --------------------------------------------------------

print("🔍 Checking LoRA path:", LORA_PATH)

if os.path.exists(LORA_PATH):
    print("✅ LoRA folder FOUND")
    print("📂 Files:", os.listdir(LORA_PATH)[:10])
else:
    print("❌ LoRA folder NOT FOUND — check path carefully")

# --------------------------------------------------------
# LOAD MODEL + LORA
# --------------------------------------------------------

def load_model():
    global processor, model, MODEL_LOADED
    try:
        print("🔄 Loading Processor...")
        processor = AutoProcessor.from_pretrained(
            BASE_MODEL_NAME,
            trust_remote_code=True
        )

        print("🔄 Loading Base Model...")
        base_model = Qwen2VLForConditionalGeneration.from_pretrained(
            BASE_MODEL_NAME,
            trust_remote_code=True,
            torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
            device_map="auto" if DEVICE == "cuda" else None
        )

        print("🔄 Loading LoRA Adapter...")
        model = PeftModel.from_pretrained(base_model, LORA_PATH)
        model.eval()

        MODEL_LOADED = True
        print("✅ MODEL + LORA LOADED SUCCESSFULLY")

    except Exception:
        MODEL_LOADED = False
        print("❌ MODEL LOAD FAILED")
        traceback.print_exc()

# Load at startup
if os.path.exists(LORA_PATH):
    load_model()
else:
    print("⚠️ Running in DUMMY MODE")

# --------------------------------------------------------
# UTILS
# --------------------------------------------------------

def decode_base64_image(b64str: str) -> Optional[Image.Image]:
    try:
        img_bytes = base64.b64decode(b64str.split(",")[-1])
        return Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except:
        return None


def clean_answer(text: str) -> str:
    text = re.split(r"assistant", text, flags=re.I)[-1]
    text = re.sub(r"<.*?>", "", text)
    return text.strip()

# --------------------------------------------------------
# ROUTES
# --------------------------------------------------------

@app.route("/health")
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": MODEL_LOADED
    })


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        img = None
        query = ""

        # JSON input
        if request.content_type and "json" in request.content_type:
            data = request.get_json()
            query = data.get("query", "")
            img = decode_base64_image(data.get("imageBase64", ""))

        # multipart/form-data
        else:
            query = request.form.get("query", "")
            file = request.files.get("image")
            if file:
                img = Image.open(file.stream).convert("RGB")

        if not MODEL_LOADED:
            return jsonify({
                "status": "success",
                "model_loaded": False,
                "answer": "Model not loaded. Fix LoRA path and restart."
            })

        prompt = (
            f"<image>\nQuestion: {query}\n\n"
            "Give the final answer in 3 to 4 lines. "
            "Provide pest identification and prevention steps. "
            "Only the final answer."
        )

        messages = [{
            "role": "user",
            "content": [{"type": "text", "text": prompt}]
        }]

        if img:
            messages[0]["content"].append({"type": "image", "image": img})

        inputs = processor.apply_chat_template(
            messages,
            tokenize=True,
            return_tensors="pt",
            add_generation_prompt=True,
            return_dict=True
        )

        inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

        with torch.no_grad():
            output = model.generate(
                **inputs,
                max_new_tokens=128,
                pad_token_id=processor.tokenizer.pad_token_id
            )

        decoded = processor.tokenizer.decode(
            output[0], skip_special_tokens=True
        )
        answer = clean_answer(decoded)

        return jsonify({
            "status": "success",
            "model_loaded": True,
            "answer": answer
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }), 500

# --------------------------------------------------------
# MAIN
# --------------------------------------------------------

if __name__ == "__main__":
    print("🚀 Flask running on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
