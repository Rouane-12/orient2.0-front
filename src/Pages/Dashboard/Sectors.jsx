import { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { 
  GraduationCap, 
  Search,
  Filter,
  BookOpen,
  TrendingUp
} from 'lucide-react';

const Sectors = () => {
  const [sectors, setSectors] = useState([]);
  const [filteredSectors, setFilteredSectors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}api/sector/all`);
        setSectors(response.data);
        setFilteredSectors(response.data);
      } catch (error) {
        console.error('Error fetching sectors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sectors.filter(sector =>
        sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sector.description && sector.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSectors(filtered);
    } else {
      setFilteredSectors(sectors);
    }
  }, [searchTerm, sectors]);

  if (loading) {
    return <div className="dashboard__loading">Chargement...</div>;
  }

  return (
    <div className="sectors-page">
      <div className="sectors-page__header">
        <div>
          <h1>Secteurs & Filières</h1>
          <p>Explorez tous les secteurs disponibles pour votre orientation</p>
        </div>
      </div>

      <div className="sectors-page__search">
        <div className="search-input">
          <Search size={20} />
          <input
            type="text"
            placeholder="Rechercher un secteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredSectors.length === 0 ? (
        <div className="sectors-page__empty">
          <GraduationCap size={64} color="#ffb37a" />
          <h2>Aucun secteur trouvé</h2>
          <p>Essayez une autre recherche</p>
        </div>
      ) : (
        <div className="sectors-page__grid">
          {filteredSectors.map((sector) => (
            <div key={sector._id} className="sector-card">
              <div className="sector-card__icon">
                <GraduationCap size={32} color="#ffb37a" />
              </div>
              <div className="sector-card__content">
                <h3>{sector.name}</h3>
                {sector.description && (
                  <p>{sector.description}</p>
                )}
                {sector.outlets && sector.outlets.length > 0 && (
                  <div className="sector-card__outlets">
                    <span className="sector-card__outlets-label">Débouchés:</span>
                    <div className="sector-card__outlets-list">
                      {sector.outlets.slice(0, 3).map((outlet, i) => (
                        <span key={i} className="outlet-tag">{outlet}</span>
                      ))}
                      {sector.outlets.length > 3 && (
                        <span className="outlet-tag outlet-tag--more">
                          +{sector.outlets.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="sector-card__footer">
                <button className="btn-text">
                  En savoir plus
                  <TrendingUp size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sectors;
