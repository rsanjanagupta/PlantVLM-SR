

require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const FLASK_URL = process.env.FLASK_URL || 'http://127.0.0.1:5000/analyze';

// Allow JSON bodies and CORS
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*'
}));

// Ensure upload folder exists
const uploadFolder = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadFolder)) fs.mkdirSync(uploadFolder);

// Multer storage (temp files)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', node: true }));

/**
 * POST /upload-and-analyze
 * Accepts multipart/form-data:
 *  - image (file, optional)
 *  - query (string, optional)
 *  - email (string, optional)
 *  - location (string/JSON, optional)
 */
app.post('/upload-and-analyze', upload.single('image'), async (req, res) => {
  const file = req.file;
  const { query, email, location } = req.body;

  try {
    const form = new FormData();

    if (file) {
      form.append('image', fs.createReadStream(file.path), {
        filename: file.originalname,
        contentType: file.mimetype
      });
    }

    if (query) form.append('query', query);
    if (email) form.append('email', email);
    if (location) form.append('location', location);

    const flaskResp = await axios.post(FLASK_URL, form, {
      headers: {
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 2 * 60 * 1000 // 2 minutes
    });

    // cleanup temp file
    if (file) {
      fs.unlink(file.path, (err) => { if (err) console.warn('unlink error:', err); });
    }

    return res.status(flaskResp.status).json(flaskResp.data);
  } catch (err) {
    // attempt clean up
    if (file && fs.existsSync(file.path)) {
      try { fs.unlinkSync(file.path); } catch (_) {}
    }

    console.error('Forward error:', err?.message || err);
    const status = err.response?.status || 500;
    const data = err.response?.data || { message: err.message || 'Server error' };
    return res.status(status).json({ error: true, details: data });
  }
});

app.listen(PORT, () => {
  console.log(`Node backend listening on http://localhost:${PORT} -> forwarding to ${FLASK_URL}`);
});

