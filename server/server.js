const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 300 });

app.use(cors());
app.use(express.json());

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const normalizeMovie = (movie) => ({
  id: movie.id,
  title: movie.title || 'Untitled',
  overview: movie.overview || 'No description available.',
  poster: movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
    : 'https://via.placeholder.com/500x750?text=No+Poster',
  releaseDate: movie.release_date || 'N/A',
  rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
  voteCount: movie.vote_count || 0
});

app.get('/api/movies/explore', async (req, res) => {
  try {
    const { category = 'popular', page = 1 } = req.query;
    const cacheKey = `explore_${category}_${page}`;
    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${category}`, {
      params: { api_key: process.env.TMDB_API_KEY, page }
    });
    const normalizedData = {
      page: response.data.page,
      totalPages: response.data.total_pages,
      results: response.data.results.map(normalizeMovie)
    };
    cache.set(cacheKey, normalizedData);
    res.json(normalizedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch movies from upstream service.' });
  }
});

app.get('/api/movies/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    if (!query) return res.status(400).json({ error: 'Search query is required' });
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: { api_key: process.env.TMDB_API_KEY, query, page }
    });
    res.json({
      page: response.data.page,
      totalPages: response.data.total_pages,
      results: response.data.results.map(normalizeMovie)
    });
  } catch (error) {
    res.status(500).json({ error: 'Search service unavailable.' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${id}`, {
      params: { api_key: process.env.TMDB_API_KEY }
    });
    res.json(normalizeMovie(response.data));
  } catch (error) {
    res.status(404).json({ error: 'Movie details not found.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
