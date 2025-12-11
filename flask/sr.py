# import os
# import io
# import base64
# import traceback
# import re
# from typing import Optional

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from PIL import Image

# import torch
# from transformers import AutoProcessor, Qwen2VLForConditionalGeneration, logging as hf_logging
# from peft import PeftModel


# # --------------------------------------------------------
# # PATHS — YOUR EXACT FOLDER STRUCTURE
# # --------------------------------------------------------

# BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# LORA_PATH = os.path.join(BASE_DIR, r"H:\sem5\PS\dream-vlm\flask\qwen2vl_grpo_lora_ultrafast_fixed-20251209T071052Z-1-001")  
# BASE_MODEL_NAME = "Qwen/Qwen2-VL-2B-Instruct"

# DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# hf_logging.set_verbosity_error()

# app = Flask(__name__)
# CORS(app)

# processor = None
# model = None
# MODEL_LOADED = False


# # --------------------------------------------------------
# # LOAD MODEL + LORA
# # --------------------------------------------------------
# def load_model():
#     global processor, model, MODEL_LOADED

#     try:
#         print("🔄 Loading Processor...")
#         processor = AutoProcessor.from_pretrained(BASE_MODEL_NAME, trust_remote_code=True)

#         print("🔄 Loading Base Model...")
#         base_model = Qwen2VLForConditionalGeneration.from_pretrained(
#             BASE_MODEL_NAME,
#             trust_remote_code=True,
#             torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
#             device_map="auto" if DEVICE == "cuda" else None
#         )

#         print("🔄 Loading LoRA from:", LORA_PATH)
#         model = PeftModel.from_pretrained(base_model, LORA_PATH)
#         model.eval()

#         MODEL_LOADED = True
#         print("✅ Model Loaded Successfully!")

#     except Exception as e:
#         MODEL_LOADED = False
#         print("❌ Failed to load LoRA model:", e)
#         traceback.print_exc()


# # Load at startup
# if os.path.exists(LORA_PATH):
#     load_model()
# else:
#     print("⚠️ LoRA folder not found — using dummy mode.")

# # --------------------------------------------------------
# # UTIL — decode base64 image
# # --------------------------------------------------------
# def decode_base64_image(b64str: str) -> Optional[Image.Image]:
#     try:
#         header_removed = b64str.split(",")[-1]
#         img_bytes = base64.b64decode(header_removed)
#         return Image.open(io.BytesIO(img_bytes)).convert("RGB")
#     except:
#         return None


# # --------------------------------------------------------
# # CLEAN RESPONSE
# # --------------------------------------------------------
# def clean_answer(text: str) -> str:
#     text = re.split(r"assistant", text, flags=re.I)[-1]
#     text = re.sub(r"<.*?>", "", text)
#     return text.strip()


# # --------------------------------------------------------
# # HEALTH CHECK
# # --------------------------------------------------------
# @app.route("/health")
# def health():
#     return jsonify({"status": "ok", "model_loaded": MODEL_LOADED})


# # --------------------------------------------------------
# # MAIN ANALYZE ENDPOINT
# # --------------------------------------------------------
# @app.route("/analyze", methods=["POST"])
# def analyze():
#     try:
#         img = None
#         query = ""

#         # JSON input
#         if request.content_type and "json" in request.content_type:
#             data = request.get_json()
#             query = data.get("query", "")
#             b64 = data.get("imageBase64")
#             img = decode_base64_image(b64) if b64 else None

#         # Form-data input
#         else:
#             query = request.form.get("query", "")
#             file = request.files.get("image")
#             if file:
#                 img = Image.open(file.stream).convert("RGB")

#         # Dummy mode
#         if not MODEL_LOADED:
#             return jsonify({
#                 "status": "success",
#                 "model_loaded": False,
#                 "answer": "Model not yet loaded. Add LoRA folder and restart.",
#                 "raw": None
#             })

#         # Build prompt (same as your training code)
#         prompt = (
#             f"<image>\nQuestion: {query}\n\n"
#             "Give the final answer in 3 to 4 lines. "
#             "Provide a clear explanation of the pest identification and prevention steps. "
#             "Do NOT include tags, perception, or step-by-step reasoning — only the final 3–4 line answer."
#         )

#         messages = [{
#             "role": "user",
#             "content": [
#                 {"type": "text", "text": prompt}
#             ]
#         }]

#         if img:
#             messages[0]["content"].append({"type": "image", "image": img})

#         # Encode inputs
#         inputs = processor.apply_chat_template(
#             messages,
#             tokenize=True,
#             return_tensors="pt",
#             add_generation_prompt=True,
#             return_dict=True,
#         )
#         inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

#         # Generate output
#         with torch.no_grad():
#             output = model.generate(
#                 **inputs,
#                 max_new_tokens=128,
#                 do_sample=False,
#                 num_beams=1,
#                 pad_token_id=processor.tokenizer.pad_token_id
#             )

#         decoded = processor.tokenizer.decode(output[0], skip_special_tokens=True)
#         answer = clean_answer(decoded)

#         return jsonify({
#             "status": "success",
#             "model_loaded": True,
#             "answer": answer,
#             "raw": decoded
#         })

#     except Exception as e:
#         return jsonify({
#             "status": "error",
#             "message": str(e),
#             "traceback": traceback.format_exc()
#         }), 500


# if __name__ == "__main__":
#     print("🚀 Flask running on http://127.0.0.1:5000")
#     app.run(host="0.0.0.0", port=5000, debug=True)





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
# PATHS — fixed for your folder structure
# --------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Use the folder name exactly as it appears inside your flask directory:
LORA_FOLDER_NAME = "qwen2vl_grpo_lora_ultrafast_fixed"
LORA_PATH = os.path.join(BASE_DIR, LORA_FOLDER_NAME)

# If you prefer to use the absolute Windows path instead, uncomment this line and comment the os.path.join above:
# LORA_PATH = r"H:\sem5\PS\dream-vlm\flask\qwen2vl_grpo_lora_ultrafast_fixed-20251209T071052Z-1-001"

BASE_MODEL_NAME = "Qwen/Qwen2-VL-2B-Instruct"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

hf_logging.set_verbosity_error()

app = Flask(__name__)
CORS(app)

processor = None
model = None
MODEL_LOADED = False

# quick debug: show whether LORA_PATH exists and list some files (helps track mistakes)
print(f"[server] BASE_DIR = {BASE_DIR}")
print(f"[server] Using LORA_PATH = {LORA_PATH}")
if os.path.exists(LORA_PATH):
    try:
        files = os.listdir(LORA_PATH)
        print(f"[server] LORA folder found, first files: {files[:10]}")
    except Exception as e:
        print("[server] Could not list LORA folder contents:", e)
else:
    print("[server] WARNING: LORA folder does NOT exist at this path. Please check the folder name and location.")

# --------------------------------------------------------
# LOAD MODEL + LORA
# --------------------------------------------------------
def load_model():
    global processor, model, MODEL_LOADED

    try:
        print("🔄 Loading Processor...")
        processor = AutoProcessor.from_pretrained(BASE_MODEL_NAME, trust_remote_code=True)

        print("🔄 Loading Base Model...")
        base_model = Qwen2VLForConditionalGeneration.from_pretrained(
            BASE_MODEL_NAME,
            trust_remote_code=True,
            torch_dtype=torch.float16 if DEVICE == "cuda" else torch.float32,
            device_map="auto" if DEVICE == "cuda" else None
        )

        print("🔄 Loading LoRA from:", LORA_PATH)
        model = PeftModel.from_pretrained(base_model, LORA_PATH)
        model.eval()

        MODEL_LOADED = True
        print("✅ Model Loaded Successfully!")

    except Exception as e:
        MODEL_LOADED = False
        print("❌ Failed to load LoRA model:", e)
        traceback.print_exc()


# Load at startup
if os.path.exists(LORA_PATH):
    load_model()
else:
    print("⚠️ LoRA folder not found — using dummy mode. Fix LORA_PATH and restart the server.")

# --------------------------------------------------------
# UTIL — decode base64 image
# --------------------------------------------------------
def decode_base64_image(b64str: str) -> Optional[Image.Image]:
    try:
        header_removed = b64str.split(",")[-1]
        img_bytes = base64.b64decode(header_removed)
        return Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except:
        return None


# --------------------------------------------------------
# CLEAN RESPONSE
# --------------------------------------------------------
def clean_answer(text: str) -> str:
    text = re.split(r"assistant", text, flags=re.I)[-1]
    text = re.sub(r"<.*?>", "", text)
    return text.strip()


# --------------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------------
@app.route("/health")
def health():
    return jsonify({"status": "ok", "model_loaded": MODEL_LOADED})


# --------------------------------------------------------
# MAIN ANALYZE ENDPOINT
# --------------------------------------------------------
@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        img = None
        query = ""

        # JSON input
        if request.content_type and "json" in request.content_type:
            data = request.get_json()
            query = data.get("query", "")
            b64 = data.get("imageBase64")
            img = decode_base64_image(b64) if b64 else None

        # Form-data input
        else:
            query = request.form.get("query", "")
            file = request.files.get("image")
            if file:
                img = Image.open(file.stream).convert("RGB")

        # Dummy mode
        if not MODEL_LOADED:
            return jsonify({
                "status": "success",
                "model_loaded": False,
                "answer": "Model not yet loaded. Add LoRA folder and restart.",
                "raw": None
            })

        # Build prompt (same as your training code)
        prompt = (
            f"<image>\nQuestion: {query}\n\n"
            "Give the final answer in 3 to 4 lines. "
            "Provide a clear explanation of the pest identification and prevention steps. "
            "Do NOT include tags, perception, or step-by-step reasoning — only the final 3–4 line answer."
        )

        messages = [{
            "role": "user",
            "content": [
                {"type": "text", "text": prompt}
            ]
        }]

        if img:
            messages[0]["content"].append({"type": "image", "image": img})

        # Encode inputs
        inputs = processor.apply_chat_template(
            messages,
            tokenize=True,
            return_tensors="pt",
            add_generation_prompt=True,
            return_dict=True,
        )
        inputs = {k: v.to(DEVICE) for k, v in inputs.items()}

        # Generate output
        with torch.no_grad():
            output = model.generate(
                **inputs,
                max_new_tokens=128,
                do_sample=False,
                num_beams=1,
                pad_token_id=processor.tokenizer.pad_token_id
            )

        decoded = processor.tokenizer.decode(output[0], skip_special_tokens=True)
        answer = clean_answer(decoded)

        return jsonify({
            "status": "success",
            "model_loaded": True,
            "answer": answer,
            "raw": decoded
        })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }), 500


if __name__ == "__main__":
    print("🚀 Flask running on http://127.0.0.1:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
