const express = require('express');
const youtubeCaptionsScraper = require('youtube-captions-scraper');
const app = express();

// Middleware to parse JSON
app.use(express.json());

// API endpoint to fetch captions
app.get('/api/captions', async (req, res) => {
    const { videoUrl } = req.query;

    if (!videoUrl) {
        return res.status(400).json({ error: 'Video URL is required' });
    }

    try {
        // Extract the video ID from the YouTube URL
        const videoId = getYouTubeVideoId(videoUrl);
        
        if (!videoId) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }

        // Fetch captions using the youtube-captions-scraper package
        const captions = await youtubeCaptionsScraper.getSubtitles({ videoID: videoId, lang: 'en' }); // You can adjust the language code

        if (!captions || captions.length === 0) {
            return res.status(404).json({ error: 'No captions found for this video' });
        }

        res.json({ captions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch captions' });
    }
});

// Utility function to extract video ID from YouTube URL
function getYouTubeVideoId(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

// Port for local development or production (Vercel/Render)
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
