import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { 
  Award, 
  GraduationCap, 
  TrendingUp, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Overview = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
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

  const quickActions = [
    {
      title: 'Nouvelle orientation',
      description: 'Commencer une nouvelle orientation IA',
      icon: Award,
      action: () => navigate('/dashboard/steps'),
      color: '#ffb37a'
    },
    {
      title: 'Explorer les secteurs',
      description: 'Découvrir les filières et métiers',
      icon: GraduationCap,
      action: () => navigate('/dashboard/sectors'),
      color: '#e67028'
    },
    {
      title: 'Voir mes résultats',
      description: 'Accéder à vos orientations passées',
      icon: TrendingUp,
      action: () => navigate('/dashboard/results'),
      color: '#ffa35c'
    }
  ];

  return (
    <div className="overview">
      <div className="overview__header">
        <div>
          <h1>Bienvenue, {user?.firstname} 👋</h1>
          <p>Voici un aperçu de votre parcours d'orientation</p>
        </div>
      </div>

      <div className="overview__stats">
        {loading ? (
          <div className="overview__stats-loading">Chargement...</div>
        ) : stats ? (
          <>
            <div className="overview__stat-card">
              <div className="overview__stat-icon" style={{ background: 'rgba(255, 179, 122, 0.2)' }}>
                <GraduationCap size={24} color="#ffb37a" />
              </div>
              <div className="overview__stat-info">
                <p className="overview__stat-value">{stats.students_accompanied || 0}</p>
                <p className="overview__stat-label">Étudiants accompagnés</p>
              </div>
            </div>

            <div className="overview__stat-card">
              <div className="overview__stat-icon" style={{ background: 'rgba(230, 112, 40, 0.2)' }}>
                <TrendingUp size={24} color="#e67028" />
              </div>
              <div className="overview__stat-info">
                <p className="overview__stat-value">{stats.satisfaction_rate || 0}%</p>
                <p className="overview__stat-label">Taux de satisfaction</p>
              </div>
            </div>

            <div className="overview__stat-card">
              <div className="overview__stat-icon" style={{ background: 'rgba(255, 163, 92, 0.2)' }}>
                <Award size={24} color="#ffa35c" />
              </div>
              <div className="overview__stat-info">
                <p className="overview__stat-value">{stats.universities_partners || 0}</p>
                <p className="overview__stat-label">Universités partenaires</p>
              </div>
            </div>

            <div className="overview__stat-card">
              <div className="overview__stat-icon" style={{ background: 'rgba(255, 179, 122, 0.2)' }}>
                <CheckCircle size={24} color="#ffb37a" />
              </div>
              <div className="overview__stat-info">
                <p className="overview__stat-value">{stats.sectors_indexed || 0}</p>
                <p className="overview__stat-label">Secteurs indexés</p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="overview__section">
        <h2>Actions rapides</h2>
        <div className="overview__actions">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                className="overview__action-card"
                onClick={action.action}
                style={{ borderColor: action.color }}
              >
                <div className="overview__action-icon" style={{ background: `${action.color}20` }}>
                  <Icon size={28} color={action.color} />
                </div>
                <div className="overview__action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <ArrowRight size={20} color={action.color} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="overview__section">
        <h2>Conseils pour votre orientation</h2>
        <div className="overview__tips">
          <div className="overview__tip">
            <CheckCircle size={20} color="#ffb37a" />
            <p>Explorez différents secteurs avant de faire votre choix final</p>
          </div>
          <div className="overview__tip">
            <CheckCircle size={20} color="#ffb37a" />
            <p>Consultez les avis d'autres étudiants pour avoir des retours d'expérience</p>
          </div>
          <div className="overview__tip">
            <CheckCircle size={20} color="#ffb37a" />
            <p>N'hésitez pas à refaire une orientation si vos intérêts évoluent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
