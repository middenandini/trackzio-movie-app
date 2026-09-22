import React, { useState, useEffect } from 'react';
import { Search, Heart, Star, Film, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000/api/movies';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('popular');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('movie_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewWishlist, setViewWishlist] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    localStorage.setItem('movie_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = query 
        ? `${BACKEND_URL}/search?query=${encodeURIComponent(query)}`
        : `${BACKEND_URL}/explore?category=${category}`;
      
      const response = await axios.get(endpoint);
      setMovies(response.data.results || []);
    } catch (err) {
      setError('Unable to load movies. Please check if your backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!viewWishlist) {
      const timer = setTimeout(() => {
        fetchMovies();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [query, category, viewWishlist]);

  const toggleWishlist = (movie) => {
    setWishlist((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) return prev.filter((m) => m.id !== movie.id);
      return [...prev, movie];
    });
  };

  const displayedMovies = viewWishlist ? wishlist : movies;

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif', padding: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => setViewWishlist(false)}>
          <Film color="#6366f1" size={32} />
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#818cf8' }}>CineExplore</h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!viewWishlist && (
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search movies..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#fff', padding: '8px 12px 8px 36px', borderRadius: '8px', outline: 'none' }}
              />
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            </div>
          )}

          <button 
            onClick={() => setViewWishlist(!viewWishlist)}
            style={{ backgroundColor: viewWishlist ? '#4f46e5' : '#1e293b', border: '1px solid #4f46e5', color: '#fff', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Heart size={18} fill={viewWishlist ? '#fff' : 'none'} />
            Wishlist ({wishlist.length})
          </button>
        </div>
      </header>

      {!viewWishlist && !query && (
        <div style={{ display: 'flex', gap: '12px', margin: '20px 0' }}>
          {['popular', 'top_rated', 'upcoming'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                backgroundColor: category === cat ? '#6366f1' : '#1e293b',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}

      <main style={{ marginTop: '24px' }}>
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader size={36} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {!loading && !error && displayedMovies.length === 0 && (
          <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>
            {viewWishlist ? 'Your wishlist is empty.' : 'No movies found.'}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {displayedMovies.map((movie) => {
            const isWishlisted = wishlist.some((m) => m.id === movie.id);
            return (
              <div 
                key={movie.id} 
                style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', position: 'relative' }}
              >
                <img 
                  src={movie.poster} 
                  alt={movie.title} 
                  style={{ width: '100%', height: '280px', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => setSelectedMovie(movie)}
                />
                <button
                  onClick={() => toggleWishlist(movie)}
                  style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}
                >
                  <Heart size={18} color={isWishlisted ? '#ef4444' : '#fff'} fill={isWishlisted ? '#ef4444' : 'none'} />
                </button>
                <div style={{ padding: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{movie.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    <span>{movie.releaseDate.split('-')[0]}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#facc15' }}>
                      <Star size={14} fill="#facc15" /> {movie.rating}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {selectedMovie && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', maxWidth: '500px', width: '100%', padding: '24px', position: 'relative' }}>
            <button 
              onClick={() => setSelectedMovie(null)} 
              style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '18px', cursor: 'pointer' }}
            >
              ✕
            </button>
            <h2 style={{ marginTop: 0 }}>{selectedMovie.title}</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>Release Date: {selectedMovie.releaseDate} | Rating: ★ {selectedMovie.rating}</p>
            <p style={{ lineHeight: '1.5', marginTop: '16px' }}>{selectedMovie.overview}</p>
          </div>
        </div>
      )}
    </div>
  );
}