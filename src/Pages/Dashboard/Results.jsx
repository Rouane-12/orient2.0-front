import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { 
  Award, 
  Download, 
  Calendar,
  Eye,
  Trash2,
  FileText,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

const Results = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!token) {
        console.error('No token available');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}api/orientation/user-results`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Fetched results:', response.data);
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching results:', error);
        console.error('Token used:', token ? 'exists' : 'missing');
        toast.error('Erreur lors du chargement des résultats');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [token]);

  const captureScreenshot = async (elementId, fileName) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Erreur lors de la capture:', error);
      toast.error('Erreur lors de la capture');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Date non disponible';
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleViewDetails =async (result) => {
    const orientDataId = result.orient_user_data_id?._id || result.orient_user_data_id;
    navigate(`/resultat/${orientDataId}`);
  };

  if (loading) {
    return <div className="dashboard__loading">Chargement...</div>;
  }

  return (
    <div className="results-page">
      <div className="results-page__header">
        <div>
          <h1>Mes résultats d'orientation</h1>
          <p>Historique de toutes vos orientations</p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => navigate('/dashboard/steps')}
        >
          <Award size={20} />
          Nouvelle orientation
        </button>
      </div>

      {results.length === 0 ? (
        <div className="results-page__empty">
          <Award size={64} color="#ffb37a" />
          <h2>Aucun résultat pour le moment</h2>
          <p>Commencez votre première orientation pour voir vos résultats ici</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/dashboard/steps')}
          >
            <Award size={20} />
            Commencer une orientation
          </button>
        </div>
      ) : (
        <div className="results-page__grid">
          {results.map((result, index) => (
            <div key={result._id} className="result-card" id={`result-${result._id}`}>
              <div className="result-card__header">
                <div className="result-card__icon">
                  <Award size={32} color="#ffb37a" />
                </div>
                <div className="result-card__info">
                  <h3>Orientation #{index + 1}</h3>
                  <div className="result-card__meta">
                    <Calendar size={16} />
                    <span>{formatDate(result.createdAt)}</span>
                  </div>
                </div>
                <div className="result-card__actions">
                  <button
                    className="btn-icon"
                    onClick={() => captureScreenshot(`result-${result._id}`, `orientation-${index + 1}`)}
                    title="Télécharger"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>

              <div className="result-card__content">
                <h4>Top recommandations</h4>
                <div className="result-card__sectors">
                  {result.sectors?.slice(0, 3).map((sector, i) => (
                    <div key={i} className="result-card__sector">
                      <div className="result-card__sector-header">
                        <span className="result-card__sector-name">{sector.name}</span>
                        <span className="result-card__sector-percent">{sector.percent}%</span>
                      </div>
                      <div className="result-card__sector-progress">
                        <div 
                          className="result-card__sector-bar"
                          style={{ width: `${sector.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {result.sectors?.length > 3 && (
                    <div className="result-card__more">
                      <span>+{result.sectors.length - 3} autres secteurs</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="result-card__footer">
                <button 
                  className="btn-text"
                  onClick={() => handleViewDetails(result)}
                >
                  Voir les détails
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
