const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Initialize environment variables from a .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or fallback to 3000

const upload = multer({ dest: 'uploads/' });

// Route to handle image enhancement
app.post('/enhance', upload.single('image'), async (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `enhanced/${Date.now()}_${req.file.originalname}`;

  try {
    // Enhance the image (resize and change quality)
    await sharp(inputPath)
      .resize({ width: 2000 }) // Resize to 2000px width
      .jpeg({ quality: 90 })    // Set JPEG quality to 90
      .toFile(outputPath);

    // Send the enhanced image as the response
    res.sendFile(path.resolve(outputPath));

    // Delete the files after 3 minutes (cleanup)
    setTimeout(() => {
      fs.unlink(inputPath, () => {});
      fs.unlink(outputPath, () => {});
    }, 180000); // 3 minutes in milliseconds
  } catch (err) {
    console.error("Error processing image:", err);
    res.status(500).send("Error processing image");
  }
});

// Start the server and listen on a specific port
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running and accessible at http://0.0.0.0:${port}`);
});
