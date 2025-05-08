const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

app.post('/enhance', upload.single('image'), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `enhanced/${Date.now()}_${req.file.originalname}`;

  try {
    await sharp(inputPath)
      .resize({ width: 2000 }) // optional resize to enhance perceived quality
      .jpeg({ quality: 90 })   // increase output quality
      .toFile(outputPath);

    res.sendFile(path.resolve(outputPath));

    // Delete files after 3 minutes
    setTimeout(() => {
      fs.unlink(inputPath, () => {});
      fs.unlink(outputPath, () => {});
    }, 180000);
  } catch (err) {
    res.status(500).send("Error processing image");
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running and accessible at http://0.0.0.0:${port}`);
});
