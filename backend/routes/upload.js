const express = require('express');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Upload = require('../models/Upload');

const router = express.Router();
const UPLOAD_FOLDER = path.join(__dirname, '..', 'uploads');

// multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});
const upload = multer({ storage });

router.post('/upload-and-analyze', upload.single('image'), async (req, res) => {
  try {
    // user id (set by auth middleware as { id: ... })
    const userId = req.user && req.user.id;
    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const file = req.file;
    const question = req.body.question || '';

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    // forward to Flask
    const FLASK_URL = process.env.FLASK_URL || 'http://127.0.0.1:5000/analyze';
    const form = new FormData();
    form.append('image', fs.createReadStream(file.path), file.originalname);
    form.append('question', question);

    const headers = form.getHeaders();
    // if your Flask requires any auth headers, add here

    const flaskResp = await axios.post(FLASK_URL, form, { headers, timeout: 120000 });

    // Save in DB
    const uploadDoc = await Upload.create({
      userId,
      filename: file.filename,
      originalName: file.originalname,
      question,
      flaskResponse: flaskResp.data
    });

    // return saved result to client
    res.json({
      ok: true,
      upload: {
        id: uploadDoc._id,
        filename: uploadDoc.filename,
        originalName: uploadDoc.originalName,
        question: uploadDoc.question,
        flaskResponse: uploadDoc.flaskResponse
      }
    });
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

module.exports = router;
