const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Create folders if not exist
fs.mkdirSync('uploads', { recursive: true });
fs.mkdirSync('enhanced', { recursive: true });

// Multer config
const upload = multer({ dest: 'uploads/' });

// Enhance image API
app.post('/enhance', upload.single('image'), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputFilename = `${Date.now()}-${req.file.originalname}`;
    const outputPath = path.join('enhanced', outputFilename);

    await sharp(inputPath)
      .resize({ width: 2048 }) // upscale width
      .sharpen()
      .jpeg({ quality: 95 })
      .toFile(outputPath);

    // Send file
    res.sendFile(path.resolve(outputPath), () => {
      console.log(`Image sent: ${outputFilename}`);

      // Schedule deletion after 3 minutes
      setTimeout(() => {
        [inputPath, outputPath].forEach((file) => {
          fs.unlink(file, (err) => {
            if (err) console.error(`Failed to delete ${file}`, err);
            else console.log(`Deleted: ${file}`);
          });
        });
      }, 180000); // 3 minutes in ms
    });
  } catch (error) {
    console.error("Enhancement error:", error);
    res.status(500).json({ error: 'Image enhancement failed.' });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Image Enhancer API!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
