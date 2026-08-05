import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { 
  BarChart3, 
  Users, 
  GraduationCap, 
  TrendingUp,
  Award,
  Target
} from 'lucide-react';

const Stats = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}api/statistics`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return <div className="dashboard__loading">Chargement...</div>;
  }

  return (
    <div className="stats-page">
      <div className="stats-page__header">
        <h1>Statistiques</h1>
        <p>Vue d'ensemble des statistiques de la plateforme</p>
      </div>

      {stats ? (
        <div className="stats-page__content">
          <div className="stats-page__main-stats">
            <div className="stat-card stat-card--primary">
              <div className="stat-card__icon">
                <Users size={32} color="#ffb37a" />
              </div>
              <div className="stat-card__content">
                <p className="stat-card__value">{stats.students_accompanied || 0}</p>
                <p className="stat-card__label">Étudiants accompagnés</p>
              </div>
            </div>

            <div className="stat-card stat-card--secondary">
              <div className="stat-card__icon">
                <TrendingUp size={32} color="#e67028" />
              </div>
              <div className="stat-card__content">
                <p className="stat-card__value">{stats.satisfaction_rate || 0}%</p>
                <p className="stat-card__label">Taux de satisfaction</p>
              </div>
            </div>

            <div className="stat-card stat-card--tertiary">
              <div className="stat-card__icon">
                <GraduationCap size={32} color="#ffa35c" />
              </div>
              <div className="stat-card__content">
                <p className="stat-card__value">{stats.universities_partners || 0}</p>
                <p className="stat-card__label">Universités partenaires</p>
              </div>
            </div>

            <div className="stat-card stat-card--quaternary">
              <div className="stat-card__icon">
                <Award size={32} color="#ffb37a" />
              </div>
              <div className="stat-card__content">
                <p className="stat-card__value">{stats.sectors_indexed || 0}</p>
                <p className="stat-card__label">Secteurs indexés</p>
              </div>
            </div>
          </div>

          <div className="stats-page__details">
            <div className="stats-page__section">
              <h2>
                <Target size={24} />
                Objectifs et performance
              </h2>
              <div className="stats-page__info-cards">
                <div className="info-card">
                  <h3>Performance</h3>
                  <p>Notre IA a aidé {stats.students_accompanied || 0} étudiants à trouver leur voie.</p>
                </div>
                <div className="info-card">
                  <h3>Satisfaction</h3>
                  <p>{stats.satisfaction_rate || 0}% des utilisateurs sont satisfaits de leurs recommandations.</p>
                </div>
                <div className="info-card">
                  <h3>Couverture</h3>
                  <p>Nous collaborons avec {stats.universities_partners || 0} universités pour offrir des opportunités variées.</p>
                </div>
                <div className="info-card">
                  <h3>Diversité</h3>
                  <p>{stats.sectors_indexed || 0} secteurs différents sont indexés dans notre base de données.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="stats-page__empty">
          <BarChart3 size={64} color="#ffb37a" />
          <h2>Statistiques non disponibles</h2>
          <p>Réessayez plus tard</p>
        </div>
      )}
    </div>
  );
};

export default Stats;
