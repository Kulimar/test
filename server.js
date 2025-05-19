const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/images-list', (req, res) => {
  const dir = path.join(__dirname, 'images');
  fs.readdir(dir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' });
    }
    const imageFiles = Array.from(new Set(
      files
        .filter(file => /\.(jpe?g|png|gif|bmp|webp|heic)$/i.test(file))
        .map(file => file.replace(/\.heic$/i, '.png'))
    ));
    res.json(imageFiles);
  });
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
