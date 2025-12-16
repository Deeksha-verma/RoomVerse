const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/antigravity')
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
    if (!fs.existsSync(uploadDir)){
        fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const { exec } = require('child_process');

// Mock 3D Processing Service (Simulated with Python script)
const processImagesTo3D = (files) => {
  return new Promise((resolve, reject) => {
    console.log(`Processing ${files.length} images...`);
    
    const modelId = Date.now();
    const modelName = `room_${modelId}.obj`;
    const outputPath = path.join(__dirname, 'models', modelName);
    
    // Ensure models directory exists
    if (!fs.existsSync('models')){
        fs.mkdirSync('models');
    }

    // Call Python script to generate the model
    exec(`python3 process_images.py "${outputPath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        // Fallback to static mock if python fails
        resolve({
            modelUrl: `http://localhost:${port}/models/mock_room.obj`,
            anchors: []
        });
        return;
      }
      
      console.log(`Python Output: ${stdout}`);
      console.log(`Processing complete. Generated model: ${modelName}`);
      
      resolve({
        modelUrl: `http://localhost:${port}/models/${modelName}`,
        anchors: [
          { id: 'corner_1', position: { x: -5, y: 0, z: -5 }, label: 'North-West' },
          { id: 'corner_2', position: { x: 5, y: 0, z: -5 }, label: 'North-East' },
          { id: 'corner_3', position: { x: 5, y: 0, z: 5 }, label: 'South-East' },
          { id: 'corner_4', position: { x: -5, y: 0, z: 5 }, label: 'South-West' },
        ]
      });
    });
  });
};

app.post('/upload', upload.array('photos', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }

  try {
    const result = await processImagesTo3D(req.files);
    res.json({
      message: 'Images uploaded and processed successfully',
      data: result
    });
  } catch (error) {
    res.status(500).send('Processing failed');
  }
});

// Serve mock models
app.use('/models', express.static('models'));

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
