# 🌱 PlantVLM-SR: Vision-Language Model for Crop Pest Detection & Advisory

PlantVLM-SR is a **Vision–Language Model (VLM) based intelligent crop pest detection system** that analyzes plant images and answers natural-language questions.

This project fine-tunes **Qwen2-VL-2B-Instruct** using SFT followed by **LoRA + GRPO (reinforcement learning)** to produce **visually grounded, domain-specific answers** for agricultural pest management.

---

## 🚀 Key Features

- 🖼️ **Image + Text Understanding** using Qwen2-VL
- 🧠 **GRPO-based Reinforcement Learning** for better reasoning & grounding
- 🔧 **LoRA fine-tuning** (memory efficient, no full model training)
- 🌾 **Domain-specific pest detection & prevention advice**
- ⚡ **4-bit quantized inference** (T4 / consumer GPU friendly)
- 🌐 **Web-based UI** (React + Flask backend)

---

## 🧠 Model Architecture

- **Base Model:** Qwen2-VL-2B-Instruct
- **Adapter Type:** LoRA (Language-only, cleaned for inference)
- **Training Method:** GRPO (Guided Reinforcement Policy Optimization)
- **Precision:** 4-bit NF4 quantization
- **Frameworks:** PyTorch, Hugging Face Transformers, PEFT

> ⚠️ Important: The final adapter is **language-only**. Vision LoRA layers were removed because **PEFT does not support Conv3D / vision LoRA for inference**.

---

## 🔬 Training Methodology (GRPO)

1. Load Qwen2-VL with 4-bit quantization
2. Attach LoRA adapters to **language layers only**
3. Freeze base weights
4. Generate model responses
5. Compare with ground-truth
6. Assign rewards
7. Update LoRA weights via GRPO

This improves:

- Visual grounding
- Domain accuracy
- Answer consistency

---

## 🧪 Inference Pipeline

1. User uploads an image
2. User enters a question
3. Image + text are aligned using Qwen2-VL message format
4. Flask API runs inference
5. Model returns pest name + prevention steps

**Important alignment format:**

```python
messages = [
  {
    "role": "user",
    "content": [
      {"type": "image"},
      {"type": "text", "text": question}
    ]
  }
]
```

---

## 📦 Deployment Notes

- Tested on Google Colab (T4 GPU)
- Local Windows GPU supported
- Adapter hosted separately (Hugging Face Hub recommended)
- Base model loaded from local or HF cache

---

## 🎯 Use Cases

- Farmer decision support systems
- Smart agriculture platforms
- Research in vision-language grounding
- Educational AI for crop protection

---

## 📌 Future Work

- Multi-pest detection per image
- Confidence scoring
- Multilingual farmer queries
- Mobile deployment
- Larger-scale RL training

---

## ⭐ Acknowledgements

- Hugging Face Transformers & PEFT
- Qwen Team (Alibaba)
- PyTorch
- Google Colab

---

> If you find this project useful, ⭐ star the repository and feel free to build upon it.
