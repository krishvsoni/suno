import express from 'express';
import cors from 'cors';
import axios from 'axios';


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Suno API',
    });
});

app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const options = {
        method: 'GET',
        url: 'https://spotify23.p.rapidapi.com/search/',
        params: {
            q: query,
            type: 'multi',
            offset: '0',
            limit: '10',
            numberOfTopResults: '5',
        },
        headers: {
            'x-rapidapi-key': process.env.SEARCH_API,
            'x-rapidapi-host': 'spotify23.p.rapidapi.com',
        },
    };

    try {
        const response = await axios.request(options);
        if (response.data) {
            res.json(response.data);
        } else {
            res.status(404).json({ error: 'No results found for the query' });
        }
    } catch (error) {
        console.error('Error fetching data from Spotify:', error);
        res.status(500).json({ error: 'Failed to fetch data from Spotify API' });
    }
});

app.get('/api/play', async (req, res) => {
    const { songName, artistName } = req.query;

    if (!songName) {
        return res.status(400).json({ error: 'Song name is required' });
    }

    try {
       
        const youtubeSearchOptions = {
            method: 'GET',
            url: 'https://www.googleapis.com/youtube/v3/search',
            params: {
                q: `${songName} ${artistName || ''}`,
                part: 'snippet',
                maxResults: 1,
                key: process.env.SEARCH_API,
            },
        };

        const youtubeResponse = await axios.request(youtubeSearchOptions);
        const youtubeData = youtubeResponse.data;

        if (youtubeData.items && youtubeData.items.length > 0) {
            const video = youtubeData.items[0];
            res.json({
                message: `Playing: ${songName} by ${artistName || 'Unknown Artist'}`,
                video: {
                    title: video.snippet.title,
                    videoId: video.id.videoId,
                    url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
                },
            });
        } else {
            res.status(404).json({ error: 'No video found for the song.' });
        }
    } catch (error) {
        console.error('Error fetching video data:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch video data from YouTube API' });
    }
});

app.listen(PORT, () => {
    console.log(`Suno server running on http://localhost:${PORT}`);
});
