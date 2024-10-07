require('dotenv').config();
const express = require('express');
const axios = require('axios');
const youtubeCaptionsScraper = require('youtube-captions-scraper');
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(cors())
app.use(express.json());

let prompt = "'Introduction:\r\nThe video begins by discussing the summer of 2020 when COVID-19 was impacting the world, with businesses in Boulder, Colorado, struggling to survive. The speaker helped the community raise money for these businesses using a unique and more democratic funding method called quadratic funding, which is relatively new. The concept was invented by Glen Weyl, Vitalik Buterin, and Zoë Hitzig in 2018 to create a mathematically optimal way to fund community goods. The introduction explains that quadratic funding differs from typical crowdfunding models like Patreon or Kickstarter by using a matching funds mechanism to ensure a fairer distribution of funds.\r\n\r\nTopics with Timestamps:\r\nQuadratic Funding Concept (00:00:26)\r\nOrigin of Quadratic Funding (00:00:31)\r\nQuadratic Funding Formula (00:01:02)\r\nMatching Campaigns Explained (00:01:19)\r\nExample of Quadratic Funding (00:02:19)\r\nMathematics of Quadratic Funding (00:03:18)\r\nHigh-Resolution Preference Mapping (00:05:56)\r\nUse Cases for Quadratic Funding (00:06:43)\r\nQuadratic Funding in Crypto and Communities (00:07:01)\r\nChallenges and Solutions of Quadratic Funding (00:09:17)\r\nTechnology and Civic Good (00:10:05)' This is the summarized data of another youtube video so from this below generate same data according to captions provided exactly should have introduction part and topics with timestamp and don't want description of topics but just topics with timestamp and give response in json format and I want introduction part and topics part compulsory and compulsory in the form of '{introduction:'....',topics:[{timestamp:'...',topic:'....'},{timestamp:'...',topic:'....'},{timestamp:'...',topic:'....'},...]}' ";
prompt="Analyze these below video captions to create timestamps and a summary.\nRules:\nSummary: Create a Summary of the entire video\nCreate 5-10 segments (min 2 minutes each)\nSkip intros under 30 seconds and promotional segments\nTitle format: [MM:SS] Clear Topic \n\nFormat output exactly as:\nSummary: Concise summary here.\nCaptions:\n[MM:SS] First Topic\n[MM:SS] Next Topic and response should be exactly in json '{summary:'...',topics:[{timestamp:'...',topic:'...'},{timestamp:'...',topic:'...'},{timestamp:'...',topic:'...'},...]}'\n";

app.get('/api/summarizedcaptions', async (req, res) => {
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

        const convertSecondsToTime = seconds => {
            
            let hrs = Math.floor(seconds / 3600);
            let mins = Math.floor((seconds % 3600) / 60);
            let secs = Math.floor(seconds % 60);
        
            // Add leading zeroes if the values are less than 10
            hrs = hrs < 10 ? '0' + hrs : hrs;
            mins = mins < 10 ? '0' + mins : mins;
            secs = secs < 10 ? '0' + secs : secs;
        
            return `${hrs}:${mins}:${secs}`;
        }

        const captionsWithTimeStamp = captions.map(caption=>{
            return {start:convertSecondsToTime(parseFloat(caption.start)),
                text:caption.text}
        })

        prompt = prompt+JSON.stringify(captionsWithTimeStamp);
        
        const url = 'https://api.openai.com/v1/chat/completions';
    const data = {
        model: "gpt-4o-mini", // You can change to 'gpt-4' if you have access
        messages: [{ role: 'user', content: prompt }],
    };

    const response = await axios.post(url, data, {
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
    });

    const message = response.data.choices[0].message.content;
    res.status(200).json({ response: JSON.parse(message.slice(7,-3)) });

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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
