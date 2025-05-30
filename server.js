const express = require('express');
const bodyParser = require('body-parser');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

app.post('/convert', async (req, res) => {
    const { url, format, quality } = req.body;
    if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: 'Invalid YouTube URL.' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, '');
        const extension = format === 'mp3' ? 'mp3' : 'mp4';
        const filename = title + '.' + extension;
        const filepath = path.join(outputDir, filename);

        if (format === 'mp3') {
            const stream = ytdl(url, { quality: 'highestaudio' });
            ffmpeg(stream)
                .audioBitrate(128)
                .save(filepath)
                .on('end', () => {
                    res.json({ downloadUrl: '/download/' + encodeURIComponent(filename) });
                })
                .on('error', (err) => {
                    console.error(err);
                    res.status(500).json({ error: 'Conversion failed. Please try again.' });
                });
        } else if (format === 'mp4') {
            const stream = ytdl(url, { quality: quality });
            stream.pipe(fs.createWriteStream(filepath))
                .on('finish', () => {
                    res.json({ downloadUrl: '/download/' + encodeURIComponent(filename) });
                })
                .on('error', (err) => {
                    console.error(err);
                    res.status(500).json({ error: 'Conversion failed. Please try again.' });
                });
        } else {
            res.status(400).json({ error: 'Invalid format selected.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred during processing.' });
    }
});

app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(outputDir, filename);

    if (fs.existsSync(filepath)) {
        res.download(filepath);
    } else {
        res.status(404).send('File not found.');
    }
});

app.listen(port, () => {
    console.log('Server is running at http://localhost:' + port);
});
