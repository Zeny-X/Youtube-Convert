const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/convert', (req, res) => {
  const { url, format } = req.body;

  if (!url || !format) {
    return res.status(400).send('URL and format are required.');
  }

  const outputFileName = `output_${Date.now()}.${format}`;
  const command = format === 'mp3'
    ? `./yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputFileName}" "${url}"`
    : `./yt-dlp -f bestvideo+bestaudio -o "${outputFileName}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return res.status(500).send('Failed to download the video.');
    }

    const filePath = path.join(__dirname, outputFileName);
    res.download(filePath, (err) => {
      if (err) {
        console.error(`Error sending file: ${err.message}`);
      }
      fs.unlink(filePath, () => {});
    });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
