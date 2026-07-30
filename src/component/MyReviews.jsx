import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PhStar, PhStarFill, PhPencil, PhTrash, PhX } from '../uikits/Icons';
import './MyReviews.css';

const MyReviews = ({ onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    school_level: '',
    stars: 5,
    message: ''
  });

  useEffect(() => {
    const userId = localStorage.getItem('orienta_user_id');
    if (userId) {
      fetchUserReviews(userId);
    }
  }, []);

  const fetchUserReviews = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5200/api/reviews/user/${userId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Erreur récupération avis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setEditFormData({
      name: review.name,
      school_level: review.school_level,
      stars: review.stars,
      message: review.message
    });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditFormData({
      name: '',
      school_level: '',
      stars: 5,
      message: ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('orienta_user_id');
    
    try {
      await axios.put(`http://localhost:5200/api/reviews/${editingReview._id}`, {
        ...editFormData,
        userId
      });
      
      // Refresh reviews
      fetchUserReviews(userId);
      handleCancelEdit();
    } catch (error) {
      console.error('Erreur mise à jour avis:', error);
      alert('Erreur lors de la mise à jour de l\'avis');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) {
      return;
    }

    const userId = localStorage.getItem('orienta_user_id');
    
    try {
      await axios.delete(`http://localhost:5200/api/reviews/${reviewId}`, { data: { userId } });
      
      // Refresh reviews
      fetchUserReviews(userId);
    } catch (error) {
      console.error('Erreur suppression avis:', error);
      alert('Erreur lors de la suppression de l\'avis');
    }
  };

  if (loading) {
    return (
      <div className="my-reviews-overlay">
        <div className="my-reviews-container">
          <div className="my-reviews-header">
            <h2>Mes Avis</h2>
            <button className="close-btn" onClick={onClose}>
              <PhX size={24} />
            </button>
          </div>
          <div className="loading">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-reviews-overlay">
      <div className="my-reviews-container">
        <div className="my-reviews-header">
          <h2>Mes Avis</h2>
          <button className="close-btn" onClick={onClose}>
            <PhX size={24} />
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>Vous n'avez pas encore laissé d'avis.</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review._id} className="review-item">
                {editingReview?._id === review._id ? (
                  <form className="edit-review-form" onSubmit={handleUpdate}>
                    <div className="form-group">
                      <label>Nom complet</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Niveau scolaire</label>
                      <input
                        type="text"
                        value={editFormData.school_level}
                        onChange={(e) => setEditFormData({ ...editFormData, school_level: e.target.value })}
                        required
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
                            onClick={() => setEditFormData({ ...editFormData, stars: star })}
                          >
                            {star <= editFormData.stars ? (
                              <PhStarFill size={20} />
                            ) : (
                              <PhStar size={20} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea
                        value={editFormData.message}
                        onChange={(e) => setEditFormData({ ...editFormData, message: e.target.value })}
                        required
                        maxLength={500}
                        rows={3}
                      />
                    </div>
                    <div className="edit-actions">
                      <button type="button" className="cancel-btn" onClick={handleCancelEdit}>
                        Annuler
                      </button>
                      <button type="submit" className="save-btn">
                        Enregistrer
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="review-header">
                      <div className="review-info">
                        <h3>{review.name}</h3>
                        <span className="review-level">{review.school_level}</span>
                      </div>
                      <div className="review-actions">
                        <button className="action-btn" onClick={() => handleEdit(review)}>
                          <PhPencil size={18} />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDelete(review._id)}>
                          <PhTrash size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="review-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>
                          {star <= review.stars ? (
                            <PhStarFill size={16} />
                          ) : (
                            <PhStar size={16} />
                          )}
                        </span>
                      ))}
                    </div>
                    <p className="review-message">{review.message}</p>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviews;
