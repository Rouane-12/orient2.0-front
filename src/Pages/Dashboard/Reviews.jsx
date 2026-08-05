import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { 
  MessageSquare, 
  Star,
  ThumbsUp,
  Calendar,
  User,
  Plus,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const Reviews = () => {
  const { user, token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    school_level: '',
    stars: 5,
    message: ''
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}api/reviews/user/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [token, user.id]);

  const handleAddReview = async () => {
    if (!formData.name || !formData.school_level || !formData.message) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}api/reviews`, {
        ...formData,
        userId: user.id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setReviews([response.data, ...reviews]);
      setShowAddForm(false);
      setFormData({ name: '', school_level: '', stars: 5, message: '' });
      toast.success('Avis ajouté avec succès !');
    } catch (error) {
      console.error('Error adding review:', error);
      toast.error('Erreur lors de l\'ajout de l\'avis');
    }
  };

  const handleUpdateReview = async () => {
    if (!editingReview) return;

    try {
      const response = await axios.put(`${API_BASE_URL}api/reviews/${editingReview._id}`, {
        ...formData,
        userId: user.id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setReviews(reviews.map(r => r._id === editingReview._id ? response.data : r));
      setEditingReview(null);
      setShowAddForm(false); // Hide form immediately after update
      setFormData({ name: '', school_level: '', stars: 5, message: '' });
      toast.success('Avis modifié avec succès !');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Erreur lors de la modification de l\'avis');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return;

    try {
      await axios.delete(`${API_BASE_URL}api/reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        data: { userId: user.id }
      });

      setReviews(reviews.filter(r => r._id !== reviewId));
      toast.success('Avis supprimé avec succès !');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Erreur lors de la suppression de l\'avis');
    }
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setFormData({
      name: review.name,
      school_level: review.school_level,
      stars: review.stars,
      message: review.message
    });
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setShowAddForm(false);
    setFormData({ name: '', school_level: '', stars: 5, message: '' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={interactive ? 24 : 16}
        fill={i < rating ? '#ffb37a' : 'none'}
        color={i < rating ? '#ffb37a' : 'rgba(255, 255, 255, 0.2)'}
        style={interactive ? { cursor: 'pointer' } : {}}
        onClick={interactive ? () => setFormData({...formData, stars: i + 1}) : undefined}
      />
    ));
  };

  if (loading) {
    return <div className="dashboard__loading">Chargement...</div>;
  }

  return (
    <div className="reviews-page">
      <div className="reviews-page__header">
        <div>
          <h1>Avis des utilisateurs</h1>
          <p>Découvrez ce que les étudiants pensent de notre plateforme</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={20} />
          Ajouter un avis
        </button>
      </div>

      {showAddForm && (
        <div className="reviews-page__form">
          <div className="reviews-page__form-header">
            <h2>{editingReview ? 'Modifier votre avis' : 'Partagez votre expérience'}</h2>
            <button className="btn-icon" onClick={handleCancelEdit}>
              <X size={20} />
            </button>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Votre nom</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Votre nom complet"
              />
            </div>
            <div className="form-group">
              <label>Niveau scolaire</label>
              <select
                value={formData.school_level}
                onChange={(e) => setFormData({...formData, school_level: e.target.value})}
              >
                <option value="">Sélectionner...</option>
                <option value="Bac">Bac</option>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="M1">M1</option>
                <option value="M2">M2</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Note</label>
            <div className="stars-interactive">
              {renderStars(formData.stars, true)}
            </div>
          </div>

          <div className="form-group">
            <label>Votre message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="Partagez votre expérience avec Orient+..."
              rows={4}
              maxLength={500}
            />
            <span className="char-count">{formData.message.length}/500</span>
          </div>

          <div className="reviews-page__form-actions">
            <button className="btn-secondary" onClick={handleCancelEdit}>
              Annuler
            </button>
            <button 
              className="btn-primary"
              onClick={editingReview ? handleUpdateReview : handleAddReview}
            >
              {editingReview ? 'Modifier' : 'Publier'}
            </button>
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="reviews-page__empty">
          <MessageSquare size={64} color="#ffb37a" />
          <h2>Aucun avis pour le moment</h2>
          <p>Soyez le premier à laisser votre avis</p>
        </div>
      ) : (
        <div className="reviews-page__list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-card__header">
                <div className="review-card__author">
                  <div className="review-card__avatar">
                    <User size={24} color="#ffb37a" />
                  </div>
                  <div>
                    <h3 style={{ color: '#fafafa' }}>{review.name}</h3>
                    <div className="review-card__meta">
                      <span className="review-card__school">{review.school_level}</span>
                      <Calendar size={14} />
                      <span>{formatDate(review.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="review-card__rating">
                  {renderStars(review.stars)}
                </div>
              </div>

              <div className="review-card__content">
                <p>{review.message}</p>
              </div>

              <div className="review-card__footer">
                <button className="review-card__helpful">
                  <ThumbsUp size={16} />
                  <span>Utile</span>
                </button>
                {user && review.userId === user.id && !editingReview && (
                  <div className="review-card__actions">
                    <button 
                      className="btn-icon"
                      onClick={() => handleEditClick(review)}
                      title="Modifier"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={() => handleDeleteReview(review._id)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
