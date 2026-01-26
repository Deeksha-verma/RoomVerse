const express = require('express');
const multer = require('multer');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
const port = 3000;

console.log("MongoDB URI: ", process.env.MONGO_URI);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth', authRoutes);

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
    files: 300
  }
});

const reconstructionService = require('./services/reconstructionService');

app.post('/upload', upload.array('photos', 300), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  try {
    // 1. Kick off the reconstruction process on KIRI
    const jobInfo = await reconstructionService.startReconstruction(req.files);

    // 2. Return the jobId so the frontend can poll for progress
    res.json({
      message: 'Images uploaded to KIRI, processing started',
      jobId: jobInfo.jobId
    });

  } catch (error) {
    console.error('Processing failed:', error);
    res.status(500).send('Processing failed');
  }
});

app.get('/upload/status/:id', async (req, res) => {
  try {
    const result = await reconstructionService.checkStatus(req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Status check failed:', error);
    res.status(500).send('Status check failed');
  }
});

// Serve mock models
app.use('/models', express.static('models'));

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
