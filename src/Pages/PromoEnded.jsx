import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, Lock, GraduationCap, TrendingUp,
  ShieldCheck, Rocket, CheckCircle
} from "lucide-react";

export default function PromoEnded() {
  const navigate = useNavigate();

  return (
    <div className="page" style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fafafa', position: 'relative', overflow: 'hidden' }}>
      {/* Background effects */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.4, background: 'radial-gradient(circle, #ff6b35 0%, transparent 70%)', top: '-200px', left: '-200px' }} />
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.4, background: 'radial-gradient(circle, #e67028 0%, transparent 70%)', top: '50%', right: '-150px' }} />
        <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', filter: 'blur(80px)', opacity: 0.4, background: 'radial-gradient(circle, #ffb37a 0%, transparent 70%)', bottom: '-100px', left: '30%' }} />
      </div>
      
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, opacity: 0.03, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 24px', background: 'rgba(10, 10, 10, 0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '1.75rem', color: '#fafafa' }}>
            <span>Orient<span style={{ color: '#ffb37a' }}>+</span></span>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button 
              className="nav-btn"
              onClick={() => navigate('/login')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '8px', color: '#fafafa', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              Connexion
            </button>
            <button 
              className="nav-btn-primary"
              onClick={() => navigate('/register')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'linear-gradient(135deg, #e67028, #ca5923)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.9rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
              Inscription
            </button>
          </div>
        </div>
      </nav>

      <header style={{ position: 'relative', zIndex: 2, padding: '160px 24px 80px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              style={{
                display: 'inline-block',
                marginBottom: '24px',
                padding: '16px 24px',
                background: 'rgba(255, 179, 122, 0.1)',
                borderRadius: '50px',
                border: '1px solid rgba(255, 179, 122, 0.3)'
              }}
            >
              <Lock size={24} color="#ffb37a" />
            </motion.div>

            <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '24px', color: '#fafafa', lineHeight: 1.1 }}>
              L'offre gratuite est terminée
            </h1>
            
            <p style={{ fontSize: '1.2rem', color: 'rgba(250, 250, 250, 0.7)', marginBottom: '32px', lineHeight: 1.6 }}>
              Les 20 orientations gratuites ont été utilisées. Mais ne vous inquiétez pas, Orient+ est toujours là pour vous aider à trouver votre voie !
            </p>

            <div style={{
              background: 'linear-gradient(135deg, rgba(230, 112, 40, 0.1) 0%, rgba(202, 89, 35, 0.05) 100%)',
              border: '2px solid rgba(255, 179, 122, 0.3)',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'left',
              marginBottom: '40px'
            }}>
              <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '24px',
                textAlign: 'center'
              }}>
                Comment fonctionne Orient+ ?
              </h2>

              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    background: 'rgba(255, 179, 122, 0.2)',
                    borderRadius: '50%',
                    padding: '12px',
                    flexShrink: 0
                  }}>
                    <GraduationCap size={24} color="#ffb37a" />
                  </div>
                  <div>
                    <h3 style={{ color: '#ffb37a', fontWeight: '600', marginBottom: '8px' }}>
                      Créez votre compte
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                      Inscrivez-vous gratuitement pour accéder à toutes les fonctionnalités d'Orient+.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    background: 'rgba(255, 179, 122, 0.2)',
                    borderRadius: '50%',
                    padding: '12px',
                    flexShrink: 0
                  }}>
                    <TrendingUp size={24} color="#ffb37a" />
                  </div>
                  <div>
                    <h3 style={{ color: '#ffb37a', fontWeight: '600', marginBottom: '8px' }}>
                      Faites votre orientation
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                      Chaque orientation coûte seulement 200 FCFA. Notre IA analyse votre profil pour vous recommander les meilleures filières.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    background: 'rgba(255, 179, 122, 0.2)',
                    borderRadius: '50%',
                    padding: '12px',
                    flexShrink: 0
                  }}>
                    <Rocket size={24} color="#ffb37a" />
                  </div>
                  <div>
                    <h3 style={{ color: '#ffb37a', fontWeight: '600', marginBottom: '8px' }}>
                      Obtenez vos résultats
                    </h3>
                    <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem' }}>
                      Recevez des recommandations personnalisées avec les universités, frais et opportunités de carrière.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <CheckCircle size={32} color="#ffb37a" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '8px' }}>
                  200 FCFA
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                  Par orientation
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <ShieldCheck size={32} color="#ffb37a" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '8px' }}>
                  100% Sécurisé
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                  Paiement sécurisé
                </p>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}>
                <Sparkles size={32} color="#ffb37a" style={{ marginBottom: '16px' }} />
                <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '8px' }}>
                  IA Avancée
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                  Recommandations précises
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                style={{
                  background: 'linear-gradient(135deg, #ffb37a 0%, #e67028 100%)',
                  border: 'none',
                  padding: '16px 40px',
                  borderRadius: '50px',
                  color: 'white',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(230, 112, 40, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Sparkles size={18} />
                <span>S'inscrire maintenant</span>
                <ArrowRight size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent',
                  border: '2px solid rgba(255, 179, 122, 0.5)',
                  padding: '16px 40px',
                  borderRadius: '50px',
                  color: '#ffb37a',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                Se connecter
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <style>{`
        @media (max-width: 768px) {
          nav {
            padding: 12px 16px !important;
          }
          
          .nav-btn, .nav-btn-primary {
            padding: 8px 12px !important;
            font-size: 0.85rem !important;
          }
          
          header {
            padding: 120px 16px 60px !important;
          }
          
          h1 {
            font-size: 1.75rem !important;
            text-align: center;
          }
          
          p {
            font-size: 1rem !important;
            text-align: center;
          }
          
          div[style*="grid"] {
            grid-template-columns: 1fr !important;
          }
          
          div[style*="padding: 40px"] {
            padding: 24px !important;
          }
          
          div[style*="display: flex"] {
            flex-direction: column !important;
            align-items: center !important;
          }
          
          button {
            width: 100% !important;
            justify-content: center !important;
            padding: 14px 20px !important;
          }
        }
        
        @media (max-width: 480px) {
          h1 {
            font-size: 1.5rem !important;
          }
          
          p {
            font-size: 0.9rem !important;
          }
          
          div[style*="padding: 40px"] {
            padding: 20px !important;
          }
          
          div[style*="padding: 24px"] {
            padding: 16px !important;
          }
          
          div[style*="gap: 16px"] {
            gap: 12px !important;
          }
          
          h2 {
            font-size: 1.25rem !important;
          }
          
          h3 {
            font-size: 1rem !important;
          }
        }
      `}</style>
    </div>
  );
}
