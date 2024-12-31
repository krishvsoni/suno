'use client'

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Loader2, Play, Github } from 'lucide-react'

export default function SongPlayer() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentTrack, setCurrentTrack] = useState(null);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isLoadingTrack, setIsLoadingTrack] = useState(false);

    const debouncedSearch = useCallback(() => {
        if (query.trim() === '') return;
        setLoading(true);
        setError('');
        setResults([]);
        axios
            .get(`https://suno-server-gufef9gze7bvfxer.westindia-01.azurewebsites.net/api/search?q=${query}`)
            .then((response) => {
                const albums = response.data?.albums?.items || [];
                if (albums.length === 0) {
                    setError('No results found. Try another search term.');
                } else {
                    setResults(albums);
                }
            })
            .catch((error) => {
                console.error('Error fetching music:', error);
                setError('Failed to fetch music. Please try again.');
            })
            .finally(() => setLoading(false));
    }, [query]);

    useEffect(() => {
        const handler = setTimeout(() => {
            debouncedSearch();
        }, 500);
        return () => clearTimeout(handler);
    }, [query, debouncedSearch]);

    const playTrack = (track) => {
        if (!track || !track.name) {
            setError('No song name available for this track.');
            return;
        }

        setIsLoadingTrack(true);
        const songName = track.name;
        const artistName = track.artists?.items?.[0]?.profile?.name || 'Unknown Artist';

        axios
            .get('https://suno-server-gufef9gze7bvfxer.westindia-01.azurewebsites.net/api/play', {
                params: { songName, artistName },
            })
            .then((response) => {
                const video = response.data.video;
                if (video) {
                    setCurrentVideo(video);
                    setCurrentTrack({ songName, artistName });
                } else {
                    setError('No video found for the song.');
                }
            })
            .catch((error) => {
                console.error('Error fetching video data:', error);
                setError('Failed to fetch video data. Please try again.');
            })
            .finally(() => setIsLoadingTrack(false));
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 flex flex-col">
            <nav className="bg-purple-800 p-4 flex justify-between items-center">
                <a
                    href="https://github.com/krishvsoni/suno"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-white hover:text-purple-200 transition duration-300"
                >
                    <Github className="w-6 h-6 mr-2" />
                    Star us on GitHub
                </a>
                <h1 className="text-4xl font-extrabold font-sans text-white">suno</h1>
            </nav>
            
            <div className="flex-grow p-4 flex flex-col items-center">
                <div className="w-full max-w-md mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 bg-purple-100">
                        <h2 className="text-2xl font-bold text-purple-800">Search for Music</h2>
                    </div>
                    <div className="p-4">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                placeholder="Enter song or artist name..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                                onClick={debouncedSearch}
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300"
                            >
                                Search
                            </button>
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center mt-6">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
                    </div>
                )}

                {!loading && error && (
                    <div className="mt-4 text-red-300 text-center">{error}</div>
                )}

                {!loading && results.length > 0 && (
                    <div className="w-full max-w-md space-y-4">
                        {results.map((album) => {
                            if (!album?.data) return null;
                            const { name, artists, coverArt } = album.data;
                            const artistNames = (artists?.items || [])
                                .map((artist) => artist?.profile?.name)
                                .join(', ') || 'Unknown Artist';
                            const coverUrl = coverArt?.sources?.[0]?.url || '';

                            return (
                                <div key={album.data.uri} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-md">
                                    {coverUrl ? (
                                        <img
                                            src={coverUrl}
                                            alt={name || 'Album Art'}
                                            className="w-16 h-16 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-md bg-gray-300 flex items-center justify-center">
                                            <span className="text-gray-500">No Image</span>
                                        </div>
                                    )}
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800">{name || 'Unknown Album'}</h3>
                                        <p className="text-sm text-gray-500">{artistNames}</p>
                                    </div>
                                    <button
                                        onClick={() => playTrack(album.data)}
                                        disabled={isLoadingTrack}
                                        className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 disabled:opacity-50"
                                    >
                                        {isLoadingTrack ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Play className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

{currentVideo && (
    <div className="mt-8 w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-purple-100">
            <h2 className="text-2xl font-bold text-purple-800">Now Playing</h2>
        </div>
        <div className="p-4">
            {/* Hidden iframe */}
            <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={currentVideo.title}
                ></iframe>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{currentTrack.songName}</h3>
            <p className="text-sm text-gray-500">{currentTrack.artistName}</p>
        </div>
    </div>
)}

            </div>
        </div>
    );
}

