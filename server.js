// server.js - Express proxy for Google Apps Script
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fetch = require("node-fetch");
const path = require("path");
const app = express();
const upload = multer();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post("/upload", upload.any(), async (req, res) => {
  try {
    const formData = new FormData();
    req.files.forEach(file => {
      formData.append(file.fieldname, new Blob([file.buffer]), file.originalname);
    });

    const response = await fetch(process.env.DRIVE_UPLOAD_URL, {
      method: "POST",
      body: formData
    });
    const result = await response.json();
    res.status(response.status).json(result);
  } catch (err) {
    console.error("Upload proxy error:", err);
    res.status(500).json({ error: "Upload proxy failed" });
  }
});

app.post("/submit", async (req, res) => {
  try {
    const response = await fetch(process.env.SHEET_SUBMIT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });
    const result = await response.json();
    res.status(response.status).json(result);
  } catch (err) {
    console.error("Sheet submit proxy error:", err);
    res.status(500).json({ error: "Sheet submit proxy failed" });
  }
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
