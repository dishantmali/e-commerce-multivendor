import React, { useState, useEffect } from 'react';
import api from '../api/axios'; // Using your existing axios configuration
import '../index.css';

const CategoryMarquee = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Adjust the endpoint if your Django URL is slightly different (e.g., '/api/categories/')
        const response = await api.get('/categories/'); 
        setCategories(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading || categories.length === 0) {
    return null; // Or return a slim skeleton loader here so we don't take up extra space
  }

  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {/* 
          To keep the marquee effect seamless and infinite as requested, 
          we render the fetched array twice. This is standard for CSS marquees! 
        */}
        {[...categories, ...categories].map((cat, index) => (
          <div key={`${cat.id}-${index}`} className="category-card">
            <img 
              src={cat.image || 'https://via.placeholder.com/60?text=Img'} 
              alt={cat.name} 
              onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=Img' }}
            />
            <span>{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryMarquee;