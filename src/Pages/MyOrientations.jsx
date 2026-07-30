import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Trash2, TrendingUp } from "lucide-react";
import s from "../style/HomeNew.module.css";

export default function MyOrientations() {
  const [orientations, setOrientations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrientations();
  }, []);

  const loadOrientations = () => {
    const stored = localStorage.getItem('orienta_history');
    if (stored) {
      setOrientations(JSON.parse(stored));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette orientation ?')) {
      const updated = orientations.filter(o => o.id !== id);
      setOrientations(updated);
      localStorage.setItem('orienta_history', JSON.stringify(updated));
    }
  };

  const handleView = (orientation) => {
    // Navigate to result page with stored data
    navigate('/resultat', { state: { orientationData: orientation } });
  };

  return (
    <div className={s.page} ref={null}>
      {/* Background effects */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 
          'radial-gradient(circle at 20% 30%, rgba(255, 107, 53, 0.3) 0%, transparent 50%), ' +
          'radial-gradient(circle at 80% 70%, rgba(230, 112, 40, 0.25) 0%, transparent 50%), ' +
          'radial-gradient(circle at 50% 50%, rgba(255, 179, 122, 0.2) 0%, transparent 50%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className={s.container} style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: '3rem' }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fafafa',
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              marginBottom: '2rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              marginTop:'2rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <ArrowLeft size={18} />
            Retour
          </button>

          <div className={s.sectionEyebrow}>Mes Orientations</div>
          <h2 className={s.sectionTitle} style={{ fontSize: '2.5rem' }}>
            Historique de vos orientations
          </h2>
          <p className={s.sectionLead}>
            Retrouvez toutes vos orientations passées et consultez vos résultats détaillés.
          </p>
        </motion.div>

        {/* Orientations List */}
        {orientations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '1.5rem'
            }}
          >
            <TrendingUp size={64} style={{ color: '#e67028', marginBottom: '1.5rem' }} />
            <h3 style={{ color: '#fafafa', fontSize: '1.5rem', marginBottom: '1rem' }}>
              Aucune orientation enregistrée
            </h3>
            <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>
              Commencez une nouvelle orientation pour voir vos résultats apparaître ici.
            </p>
            <button
              onClick={() => navigate('/step')}
              style={{
                background: 'linear-gradient(135deg, #e67028, #c9591f)',
                color: '#fafafa',
                padding: '1rem 2rem',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(230, 112, 44, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(230, 112, 44, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(230, 112, 44, 0.3)';
              }}
            >
              Commencer une orientation
            </button>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {orientations.map((orientation, index) => (
              <motion.div
                key={orientation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '1.5rem',
                  padding: '2rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onClick={() => handleView(orientation)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(230, 112, 44, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ color: '#fafafa', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Orientation #{orientations.length - index}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a0a0a0', fontSize: '0.9rem' }}>
                      <Calendar size={16} />
                      {new Date(orientation.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(orientation.id);
                    }}
                    style={{
                      background: 'rgba(255, 82, 82, 0.1)',
                      border: '1px solid rgba(255, 82, 82, 0.2)',
                      color: '#ff5252',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(255, 82, 82, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 82, 82, 0.1)';
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {orientation.profile && (
                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ color: '#a0a0a0', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#e67028' }}>Série:</strong> {orientation.profile.serie || 'Non spécifiée'}
                    </p>
                    {orientation.profile.interests && orientation.profile.interests.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {orientation.profile.interests.slice(0, 3).map((interest, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'rgba(230, 112, 44, 0.1)',
                              color: '#ffb37a',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}
                          >
                            {interest}
                          </span>
                        ))}
                        {orientation.profile.interests.length > 3 && (
                          <span style={{ color: '#a0a0a0', fontSize: '0.8rem' }}>
                            +{orientation.profile.interests.length - 3} autres
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e67028', fontSize: '0.9rem', fontWeight: 500 }}>
                  Voir les résultats
                  <ArrowLeft size={16} style={{ transform: 'rotate(-90deg)' }} />
                </div>
              </motion.div>
            ))}
          </div>
        )} 

        <br />
      </div>
    </div>
  );
}
