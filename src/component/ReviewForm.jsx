import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PhStar, PhStarFill } from '../uikits/Icons';
import './ReviewForm.css';
import API_BASE_URL from '../config/api';

const ReviewForm = ({ onReviewSubmitted }) => {
  const [formData, setFormData] = useState({
    school_level: '',
    stars: 5,
    message: ''
  });
  const [hoveredStars, setHoveredStars] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Get user data from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserName(user.firstname + ' ' + user.lastname || 'Utilisateur');
    
    // Generate or retrieve userId from localStorage
    let storedUserId = localStorage.getItem('orienta_user_id');
    if (!storedUserId) {
      storedUserId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('orienta_user_id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  const handleStarClick = (rating) => {
    setFormData({ ...formData, stars: rating });
  };

  const handleStarHover = (rating) => {
    setHoveredStars(rating);
  };

  const handleStarLeave = () => {
    setHoveredStars(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}api/reviews`, { ...formData, userId, name: userName });
      setSubmitted(true);
      setFormData({ school_level: '', stars: 5, message: '' });
      setTimeout(() => setSubmitted(false), 3000);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Erreur soumission avis:', error);
      alert('Erreur lors de la soumission de l\'avis');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (submitted) {
    return (
      <div className="review-form-success">
        <PhStarFill size={48} />
        <h3>Merci pour votre avis !</h3>
        <p>Votre témoignage a été enregistré avec succès.</p>
      </div>
    );
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Laissez votre avis</h3>
      
      <div className="form-group">
        <label htmlFor="school_level">Niveau scolaire</label>
        <input
          type="text"
          id="school_level"
          name="school_level"
          value={formData.school_level}
          onChange={handleChange}
          required
          placeholder="Ex: L1, Terminale, etc."
        />
      </div>

      <div className="form-group">
        <label>Note</label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="star-button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              onMouseLeave={handleStarLeave}
            >
              {star <= (hoveredStars || formData.stars) ? (
                <PhStarFill size={24} />
              ) : (
                <PhStar size={24} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="message">Votre message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          maxLength={500}
          placeholder="Partagez votre expérience avec Orient+..."
          rows={4}
        />
        <span className="char-count">{formData.message.length}/500</span>
      </div>

      <button type="submit" className="submit-button" disabled={loading}>
        {loading ? 'Envoi en cours...' : 'Envoyer mon avis'}
      </button>
    </form>
  );
};

export default ReviewForm;
