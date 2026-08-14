import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView, animate, AnimatePresence } from "framer-motion";
import axios from 'axios';
import {
  Sparkles, Compass, GraduationCap, Brain, Rocket, ShieldCheck,
  ArrowRight, Play, ChevronDown, Star, Bell, TrendingUp, MapPin, Menu, X, Trophy, Mail, Phone,
} from "lucide-react";
import s from "../style/HomeNew.module.css";
import { useAuth } from "../context/AuthContext";
import { Button } from '../uikits/Button';
import { Input } from '../uikits/Input';
import API_BASE_URL from '../config/api';
import ImageSlideshow from '../components/ImageSlideshow';
import { toast } from 'sonner';

export default function Welcome() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({ students_accompanied: 0, satisfaction_rate: 0, universities_partners: 40, sectors_indexed: 250 });
  const [reviews, setReviews] = useState([]);
  const [promoStatus, setPromoStatus] = useState(null);
  const [showRankPopup, setShowRankPopup] = useState(false);
  const [rankInfo, setRankInfo] = useState(null);
  const [hasUsedFreeOrientation, setHasUsedFreeOrientation] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const pageRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Fetch statistics from backend
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}api/statistics`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Keep default values if API fails
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    // Fetch reviews from backend
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}api/reviews`);
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà utilisé l'orientation gratuite
    const hasGuestOrientation = localStorage.getItem('guest_orientation_id');
    setHasUsedFreeOrientation(!!hasGuestOrientation);

    // Fetch promo status
    const fetchPromoStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}api/free-orientation/status`);
        const data = await response.json();
        setPromoStatus(data);
        
        // Ne rediriger vers promo-ended que si l'utilisateur n'a pas déjà fait une orientation gratuite
        if (!data.isPromoActive && !hasGuestOrientation) {
          navigate('/promo-ended');
        }
      } catch (error) {
        console.error('Error fetching promo status:', error);
      }
    };
    fetchPromoStatus();
  }, [navigate]);

  const handleStartOrientation = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}api/free-orientation/check-rank`);
      const data = await res.json();
      if (data.rank) {
        setRankInfo(data);
        setShowRankPopup(true);
      } else {
        navigate('/guest-step');
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du rang:', err);
      navigate('/guest-step');
    }
  };

  const handleContinueOrientation = () => {
    setShowRankPopup(false);
    navigate('/guest-step');
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);

    try {
      await axios.post(`${API_BASE_URL}api/contact`, contactForm);
      toast.success('Message envoyé avec succès !');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleContactChange = (e) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 40, damping: 20, mass: 0.6 });
  const smy = useSpring(my, { stiffness: 40, damping: 20, mass: 0.6 });
  const b1x = useTransform(smx, (v) => v * 20);
  const b1y = useTransform(smy, (v) => v * 20);
  const b2x = useTransform(smx, (v) => v * -30);
  const b2y = useTransform(smy, (v) => v * -15);
  const b3x = useTransform(smx, (v) => v * 15);
  const b3y = useTransform(smy, (v) => v * 25);

  useEffect(() => {
    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth) - 0.5);
      my.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div ref={pageRef} className={s.page}>
      <div className={s.aurora} aria-hidden>
        <motion.div className={`${s.blob} ${s.blob1}`} style={{ x: b1x, y: b1y }} />
        <motion.div className={`${s.blob} ${s.blob2}`} style={{ x: b2x, y: b2y }} />
        <motion.div className={`${s.blob} ${s.blob3}`} style={{ x: b3x, y: b3y }} />
      </div>
      <div className={s.grain} aria-hidden />

      <nav className={`${s.nav} ${scrolled ? s.navScrolled : ""}`}>
        <div className={s.navInner}>
          <div className={s.brand}>
            <span>Orient<span style={{ color: "#ffb37a" }}>+</span></span>
          </div>
          <div className={s.navLinks}>
            <a href="#pourquoi">Pourquoi</a>
            <a href="#fonctionnement">Fonctionnement</a>
            <a href="#universites">Universités</a>
            <a href="#temoignages">Témoignages</a>
            <a href="#contact">Contact</a>
            <button 
              className={s.navBtn}
              onClick={() => navigate('/login')}
            >
              Connexion
            </button>
            <button 
              className={`${s.navBtn} ${s.navBtnPrimary}`}
              onClick={() => navigate('/register')}
            >
              Inscription
            </button>
          </div>
          <button className={s.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={s.mobileMenu}
          >
            <div className={s.mobileMenuOverlay} onClick={() => setMenuOpen(false)} />
            <div className={s.mobileMenuContent}>
              <button 
                className={s.mobileMenuClose} 
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              >
                <X size={24} />
              </button>
              <nav className={s.mobileMenuLinks}>
                <a href="#pourquoi" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}>Pourquoi</a>
                <a href="#fonctionnement" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}>Fonctionnement</a>
                <a href="#universites" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}>Universités</a>
                <a href="#temoignages" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}>Témoignages</a>
                <a href="#contact" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}>Contact</a>
                <a onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate('/login'); }}>Mes Orientations</a>
                <a onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate('/login'); }}>Commencer</a>
                <button 
                  className={s.mobileMenuBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Connexion
                </button>
                <button 
                  className={`${s.mobileMenuBtn} ${s.mobileMenuBtnPrimary}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Inscription
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {promoStatus && promoStatus.isPromoActive && !hasUsedFreeOrientation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(to right top, #ca5925, #ca5925, #ca5925, #ca5925, #ca5925, #d06534, #d67143, #db7d52, #e59773, #eeb196, #f4ccb9, #f8e6de)',
            padding: '15px 18px',
            textAlign: 'center',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '500',
            width: '100%',
            position: 'absolute',
            top: '70px',
            left: '0',
            right: '0',
            zIndex: 200
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Sparkles size={16} />
            <span>🎉 OFFRE SPÉCIALE : Les {promoStatus.remaining} premiers utilisateurs bénéficient d'une orientation GRATUITE !</span>
            <Sparkles size={16} />
          </span>
        </motion.div>
      )}

      {!promoStatus || !promoStatus.isPromoActive && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, #666 0%, #444 100%)',
            padding: '10px 18px',
            textAlign: 'center',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '500',
            width: '100%',
            position: 'absolute',
            top: '85px',
            left: '0',
            right: '0'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Lock size={16} />
            <span>L'offre gratuite est terminée. Connectez-vous pour faire une orientation.</span>
          </span>
        </motion.div>
      )}

      <header className={s.hero} style={{ position: 'relative', overflow: 'hidden' }}>
        <ImageSlideshow />
        <div className={s.container}>
          <div className={s.heroGrid}>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <span className={s.eyebrow}>
                <span className={s.eyebrowDot} /> Nouveau · Orientation IA pour bacheliers 2026
              </span>
              <h1 className={s.title}>
                Bienvenue, <br /> chers nouveaux bacheliers !
              </h1>
              
              <p className={s.subtitle}>
                "Grâce à notre plateforme d'orientation, découvre les filières, métiers et parcours qui te correspondent vraiment. Que tu sois étudiant, lycéen ou en reconversion, on t'accompagne pour faire les bons choix, en toute confiance."
              </p>
              <div className={s.heroCtas}>
                {promoStatus && promoStatus.isPromoActive && !hasUsedFreeOrientation ? (
                  <MagneticButton primary onClick={handleStartOrientation}>
                    Commencer l'orientation <ArrowRight size={16} />
                  </MagneticButton>
                ) : hasUsedFreeOrientation ? (
                  <MagneticButton primary onClick={() => {
                    const guestId = localStorage.getItem('guest_orientation_id');
                    if (guestId) {
                      navigate('/guest-result/' + guestId);
                    } else {
                      navigate('/login');
                    }
                  }}>
                    Voir mes résultats <ArrowRight size={16} />
                  </MagneticButton>
                ) : (
                  <MagneticButton primary onClick={() => navigate('/login')}>
                    Se connecter pour commencer <ArrowRight size={16} />
                  </MagneticButton>
                )}
              </div>
              <div className={s.heroTrust}>
                <div className={s.trustItem}>
                  <span className={s.trustNum}>40+</span>
                  <span className={s.trustLbl}>Universités partenaires</span>
                </div>
                <div className={s.trustItem}>
                  <span className={s.trustNum}>100%</span>
                  <span className={s.trustLbl}>Bénin</span>
                </div>
                <div className={s.trustItem}>
                  <span className={s.trustNum}>IA</span>
                  <span className={s.trustLbl}>Intelligente</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <PhoneMockup />
            </motion.div>
          </div>
        </div>
      </header>

      <section id="pourquoi" className={s.section}>
        <div className={s.container}>
          <SectionHead
            eyebrow="Pourquoi Orient+"
            title="Une orientation qui te ressemble, pas un classement générique."
            lead="Nous croisons ton profil académique, tes centres d'intérêt et la réalité des universités béninoises pour te guider vers le meilleur choix."
          />
          <div className={s.grid3}>
            {features.map((f, i) => <FeatureCard key={f.title} {...f} delay={i * 0.08} />)}
          </div>
        </div>
      </section>

      <section id="fonctionnement" className={s.section} style={{ paddingTop: 40 }}>
        <div className={s.container}>
          <SectionHead
            eyebrow="Comment ça marche"
            title="Trois étapes pour trouver ta voie."
            lead="En moins de dix minutes, Orient+ construit une carte claire de tes possibilités."
          />
          <div className={s.steps}>
            <div className={s.stepsLine} />
            {steps.map((st, i) => (
              <RevealDiv key={st.title} className={s.step} delay={i * 0.1}>
                <div className={s.stepDot}>{i + 1}</div>
                <h3 className={s.stepTitle}>{st.title}</h3>
                <p className={s.stepText}>{st.text}</p>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      <section className={s.section} style={{ paddingTop: 40 }}>
        <div className={s.container}>
          <SectionHead
            eyebrow="Résultats"
            title="Des chiffres qui parlent d'un vrai impact."
          />
          <div className={s.statsGrid}>
            <StatCard value={stats.students_accompanied} suffix="+" label="Étudiants accompagnés" />
            <StatCard value={stats.universities_partners} suffix="+" label="Universités partenaires" />
            <StatCard value={stats.sectors_indexed} suffix="+" label="Filières indexées" />
          </div>
        </div>
      </section>

      <section id="universites" className={s.section} style={{ paddingTop: 40 }}>
        <div className={s.container}>
          <SectionHead
            eyebrow="Universités partenaires"
            title="Les meilleures institutions, à portée de main."
          />
        </div>
        <div className={s.marquee}>
          <div className={s.marqueeTrack}>
            {[...universities, ...universities].map((u, i) => (
              <div key={i} className={s.marqueeItem}>{u}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="temoignages" className={s.section} style={{ paddingTop: 40 }}>
        <div className={s.container}>
          <SectionHead
            eyebrow="Témoignages"
            title="Étudiants accompagnés"
          />
          <div className={s.tGrid}>
            <div className={s.tGridWrapper}>
              {reviews.length >= 3 ? (
                [...reviews, ...reviews].map((review, i) => (
                  <TestimonialCard
                    key={`${review._id}-${i}`}
                    quote={review.message}
                    name={review.name}
                    role={review.school_level}
                    stars={review.stars}
                  />
                ))
              ) : reviews.length > 0 ? (
                reviews.map((review) => (
                  <TestimonialCard
                    key={review._id}
                    quote={review.message}
                    name={review.name}
                    role={review.school_level}
                    stars={review.stars}
                  />
                ))
              ) : (
                <>
                  <TestimonialCard
                    quote="En 10 minutes, j'ai eu 3 filières qui correspondaient vraiment à mon profil. J'ai choisi Data Science à l'UAC — c'était la bonne décision."
                    name="Aïcha D."
                    role="L1 Data Science, UAC"
                  />
                  <TestimonialCard
                    quote="Je pensais faire médecine par défaut. Orient+ m'a montré que le génie biomédical collait mieux à ce que j'aime vraiment."
                    name="Kwamé A."
                    role="L1 Génie biomédical, EPAC"
                  />
                  <TestimonialCard
                    quote="Une plateforme sérieuse, précise, et enfin pensée pour nous. Mes parents ont été rassurés par la clarté des recommandations."
                    name="Fatou S."
                    role="Nouvelle bachelière"
                  />
                  <TestimonialCard
                    quote="En 10 minutes, j'ai eu 3 filières qui correspondaient vraiment à mon profil. J'ai choisi Data Science à l'UAC — c'était la bonne décision."
                    name="Aïcha D."
                    role="L1 Data Science, UAC"
                  />
                  <TestimonialCard
                    quote="Je pensais faire médecine par défaut. Orient+ m'a montré que le génie biomédical collait mieux à ce que j'aime vraiment."
                    name="Kwamé A."
                    role="L1 Génie biomédical, EPAC"
                  />
                  <TestimonialCard
                    quote="Une plateforme sérieuse, précise, et enfin pensée pour nous. Mes parents ont été rassurés par la clarté des recommandations."
                    name="Fatou S."
                    role="Nouvelle bachelière"
                  />
                </>
              )}
            </div>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
                Connectez-vous pour laisser un avis
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'rgba(255, 179, 122, 0.2)',
                  border: '1px solid rgba(255, 179, 122, 0.5)',
                  color: '#ffb37a',
                  padding: '0.5rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(255, 179, 122, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(255, 179, 122, 0.2)';
                }}
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </section>

      {promoStatus && promoStatus.isPromoActive && !hasUsedFreeOrientation && (
        <section className={s.section} style={{ paddingTop: 40 }}>
          <div className={s.container}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{
                background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                border: '2px solid rgba(230, 112, 40, 0.5)',
                borderRadius: '20px',
                padding: '40px',
                textAlign: 'center'
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                style={{
                  display: 'inline-block',
                  marginBottom: '20px'
                }}
              >
                <Sparkles size={48} color="#ffb37a" />
              </motion.div>
              
              <h2 style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: 'white',
                marginBottom: '16px'
              }}>
                🎉 OFFRE DE LANCEMENT
              </h2>
              
              <p style={{
                fontSize: '1.3rem',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                Les <strong style={{ color: '#ffb37a' }}>{promoStatus.remaining} premiers utilisateurs</strong> bénéficient de leur <strong style={{ color: '#ffb37a' }}>première orientation GRATUITE</strong> !
              </p>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px',
                textAlign: 'left'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Star size={20} fill="#ffb37a" color="#ffb37a" />
                    <strong style={{ color: '#ffb37a' }}>100% Gratuit</strong>
                  </div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    Ta première orientation est offerte, sans aucun frais
                  </p>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Trophy size={20} fill="#ffb37a" color="#ffb37a" />
                    <strong style={{ color: '#ffb37a' }}>Offre Limitée</strong>
                  </div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    Réservée aux {promoStatus.maxFreeOrientations} premiers inscrits
                  </p>
                </div>
                
                <div style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Rocket size={20} fill="#ffb37a" color="#ffb37a" />
                    <strong style={{ color: '#ffb37a' }}>Immédiat</strong>
                  </div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    Profite de ton orientation dès ton inscription
                  </p>
                </div>
              </div>
              
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
                <span>Profiter de l'offre gratuite</span>
                <ArrowRight size={18} />
              </motion.button>
              
              <p style={{
                marginTop: '20px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.85rem'
              }}>
                💡 <strong>Information importante :</strong> Après cette promotion, chaque orientation coûte 200 FCFA. Profitez-en maintenant !
              </p>
            </motion.div>
          </div>
        </section>
      )}

      <section className={s.section} style={{ paddingTop: 40 }}>
        <div className={s.container}>
          <SectionHead eyebrow="FAQ" title="Les questions qu'on nous pose." />
          <div className={s.faq}>
            {faq.map((q) => <FaqItem key={q.q} q={q.q} a={q.a} />)}
          </div>
        </div>
      </section>

      <section id="contact" className={s.section} style={{ paddingTop: 40 }}>
        <div className={s.container}>
          <SectionHead 
            eyebrow="Contact" 
            title="Besoin d'aide ? Contactez-nous."
            lead="Une question ? Un problème ? Notre équipe est là pour vous répondre."
          />
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '40px',
            marginTop: '40px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '30px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#151515', marginBottom: '20px' }}>
                Nos coordonnées
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ffb37a 0%, #e67028 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Mail size={24} color="white" />
                  </div>
                  <div>
                    <div style={{ color: '#626262', fontSize: '0.875rem', marginBottom: '4px' }}>
                      Email
                    </div>
                    <div style={{ color: '#151515', fontSize: '1rem', fontWeight: '500' }}>
                      djossouvirouane6@gmail.com
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ffb37a 0%, #e67028 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Phone size={24} color="white" />
                  </div>
                  <div>
                    <div style={{ color: '#151515', fontSize: '0.875rem', marginBottom: '4px' }}>
                      Téléphone
                    </div>
                    <div style={{ color: '#151515', fontSize: '1rem', fontWeight: '500' }}>
                      014646449300
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              padding: '30px',
              borderRadius: '20px',
              border: '1px solid rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#151515', marginBottom: '20px' }}>
                Envoyez-nous un message
              </h3>
              <form onSubmit={handleContactSubmit}>
                <Input
                  label="Nom"
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  required
                  placeholder="Votre nom"
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  required
                  placeholder="votre@email.com"
                />
                <Input
                  label="Sujet"
                  type="text"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleContactChange}
                  required
                  placeholder="Sujet de votre message"
                />
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ 
                    fontWeight: '600', 
                    color: '#151515', 
                    marginBottom: '0.2rem', 
                    display: 'block', 
                    fontSize: '0.95rem' 
                  }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    placeholder="Votre message..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '16px',
                      backgroundColor: '#ffffff',
                      color: '#151515',
                      fontSize: '1rem',
                      minHeight: '120px',
                      resize: 'vertical',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  loading={contactLoading}
                  style={{ width: '100%' }}
                >
                  {contactLoading ? 'Envoi en cours...' : 'Envoyer le message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className={s.section} style={{ paddingTop: 20 }}>
        <div className={s.container}>
          <div className={s.ctaCard}>
            <h2 className={s.ctaTitle}>
              Ta place à l'université <span className={s.titleAccent}>t'attend.</span>
            </h2>
            <p className={s.sectionLead} style={{ margin: "22px auto 0" }}>
              Rejoins des milliers de bacheliers qui construisent leur avenir avec Orient+.
            </p>
            <div className={s.heroCtas} style={{ justifyContent: "center", marginTop: 32 }}>
              <MagneticButton primary onClick={() => navigate('/login')}>
                Commencer maintenant <ArrowRight size={16} />
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* Rank popup */}
      {showRankPopup && rankInfo && (
        <div className="modal flex" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(230, 112, 40, 0.95) 0%, rgba(202, 89, 35, 0.95) 100%)', border: '2px solid rgba(255, 179, 122, 0.5)', borderRadius: '20px', maxWidth: '500px', width: '100%', padding: '40px', textAlign: 'center', position: 'relative' }}>
            <button 
              onClick={() => setShowRankPopup(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.7)', fontSize: '24px', cursor: 'pointer' }}
            >
              ×
            </button>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'white', marginBottom: '16px' }}>
              Félicitations !
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255, 255, 255, 0.95)', marginBottom: '24px' }}>
              Vous êtes le <strong style={{ color: 'white', fontSize: '1.5rem' }}>{rankInfo.rank}{rankInfo.rank === 1 ? 'er' : 'e'}</strong> utilisateur !
            </p>
            <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '32px' }}>
              Il reste <strong style={{ color: 'white' }}>{rankInfo.remaining}</strong> orientations gratuites.
            </p>
            <button
              onClick={handleContinueOrientation}
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                border: 'none',
                padding: '16px 40px',
                borderRadius: '50px',
                color: '#e67028',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                width: '100%'
              }}
            >
              Continuer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionHead({ eyebrow, title, lead }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className={s.sectionEyebrow}>{eyebrow}</div>
      <h2 className={s.sectionTitle}>{title}</h2>
      {lead && <p className={s.sectionLead}>{lead}</p>}
    </motion.div>
  );
}

function RevealDiv({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, text, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const onMove = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <motion.div
      ref={ref}
      className={s.glass}
      onMouseMove={onMove}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className={s.iconWrap}><Icon size={22} /></div>
      <h3 className={s.cardTitle}>{title}</h3>
      <p className={s.cardText}>{text}</p>
    </motion.div>
  );
}

function StatCard({ value, suffix, label }) {
  const ref = useRef(null);
  const numRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  useEffect(() => {
    if (!inView || !numRef.current) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.2, 0.8, 0.2, 1],
      onUpdate: (v) => { if (numRef.current) numRef.current.textContent = Math.round(v).toLocaleString("fr-FR"); },
    });
    return () => controls.stop();
  }, [inView, value]);
  return (
    <div ref={ref} className={s.stat}>
      <div className={s.statValue}><span ref={numRef}>0</span>{suffix}</div>
      <div className={s.statLabel}>{label}</div>
    </div>
  );
}

function TestimonialCard({ quote, name, role, stars = 5 }) {
  return (
    <RevealDiv className={s.tCard}>
      <div style={{ display: "flex", gap: 4, color: "#ffb37a" }}>
        {[0,1,2,3,4].map((i) => (
          <Star 
            key={i} 
            size={14} 
            fill={i < stars ? "currentColor" : "none"} 
            strokeWidth={i < stars ? 0 : 2}
          />
        ))}
      </div>
      <p className={s.tQuote} style={{ marginTop: 14 }}>"{quote}"</p>
      <div className={s.tAuthor}>
        <div className={s.tAvatar} style={{ background: "linear-gradient(135deg, #e67028, #ca5923)" }}>
          {name.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <div className={s.tName}>{name}</div>
          <div className={s.tRole}>{role}</div>
        </div>
      </div>
    </RevealDiv>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={s.faqItem}>
      <button className={s.faqBtn} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.35 }}>
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ overflow: "hidden" }}
      >
        <div className={s.faqBody}>{a}</div>
      </motion.div>
    </div>
  );
}

function MagneticButton({ children, primary, onClick }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });
  const onMove = (e) => {
    const el = ref.current;
    const r = el.getBoundingClientRect();
    x.set(((e.clientX - r.left) / r.width - 0.5) * 14);
    y.set(((e.clientY - r.top) / r.height - 0.5) * 10);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={`${s.btn} ${s.btnLg} ${primary ? s.btnPrimary : s.btnGhost}`}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

function PhoneMockup() {
  const stageRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ["start end", "end start"] });
  const rotY = useTransform(scrollYProgress, [0, 1], [-6, 8]);
  const rotX = useTransform(scrollYProgress, [0, 1], [8, -4]);
  return (
    <div ref={stageRef} className={s.phoneStage}>
      <motion.div
        className={s.floatCard}
        style={{ top: "6%", left: "-4%" }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className={s.floatBadge}><Bell size={14} /></span>
        <div>
          <div style={{ fontWeight: 500 }}>Nouvelle recommandation</div>
          <div style={{ opacity: 0.6, fontSize: 11 }}>Génie logiciel · 94% match</div>
        </div>
      </motion.div>
      <motion.div
        className={s.floatCard}
        style={{ bottom: "10%", right: "-6%" }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <span className={s.floatBadge}><TrendingUp size={14} /></span>
        <div>
          <div style={{ fontWeight: 500 }}>Score BAC + profil</div>
          <div style={{ opacity: 0.6, fontSize: 11 }}>Analyse complète</div>
        </div>
      </motion.div>
      <motion.div
        className={s.floatCard}
        style={{ top: "42%", right: "-2%" }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <span className={s.floatBadge}><MapPin size={14} /></span>
        <div>
          <div style={{ fontWeight: 500 }}>UAC · Cotonou</div>
          <div style={{ opacity: 0.6, fontSize: 11 }}>Filière recommandée</div>
        </div>
      </motion.div>

      <motion.div
        className={s.phone}
        style={{ rotateY: rotY, rotateX: rotX }}
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className={s.phoneScreen}>
          <div className={s.phoneHeader}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className={s.phoneAvatar} />
              <div>
                <div className={s.phoneTitle}>Bonjour Amina 👋</div>
                <div className={s.phoneSub}>Tes recommandations</div>
              </div>
            </div>
            <Sparkles size={16} color="#ffb37a" />
          </div>

          {[
            { name: "Data Science", tag: "IA", pct: 96, uni: "UAC" },
            { name: "Génie logiciel", tag: "Tech", pct: 91, uni: "EPAC" },
            { name: "Économie appliquée", tag: "Business", pct: 84, uni: "UP" },
          ].map((r) => (
            <div key={r.name} className={s.recoCard}>
              <div className={s.recoTop}>
                <div className={s.recoName}>{r.name}</div>
                <div className={s.recoTag}>{r.tag}</div>
              </div>
              <div className={s.recoBar}>
                <motion.div
                  className={s.recoFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${r.pct}%` }}
                  transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1], delay: 0.4 }}
                />
              </div>
              <div className={s.recoMeta}>
                <span>{r.uni}</span>
                <span>{r.pct}% match</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const features = [
  { icon: Brain, title: "IA d'orientation", text: "Un moteur qui comprend ton profil et croise des milliers de parcours pour proposer les filières où tu réussiras." },
  { icon: Compass, title: "100% Bénin", text: "Toutes les universités, filières et débouchés locaux — pensé pour la réalité des bacheliers béninois." },
  { icon: GraduationCap, title: "Universités indexées", text: "40+ institutions publiques et privées, mises à jour chaque année avec conditions et frais." },
  { icon: Rocket, title: "Instantané", text: "En moins de 10 minutes, tu obtiens un plan clair, argumenté, prêt à partager avec tes parents." },
  { icon: ShieldCheck, title: "Confidentiel", text: "Tes données restent privées. Nous ne vendons rien, jamais. Ton profil t'appartient." },
  { icon: Sparkles, title: "Toujours à jour", text: "Nouvelles filières, quotas, dates : la plateforme évolue avec le calendrier universitaire." },
];

const steps = [
  { title: "Crée ton profil", text: "Renseigne tes notes, tes matières préférées et tes ambitions. Deux minutes suffisent." },
  { title: "L'IA analyse", text: "Nous croisons ton profil avec la carte universitaire du Bénin et les débouchés réels du marché." },
  { title: "Reçois ta feuille de route", text: "Des filières classées par affinité, avec universités, frais, prérequis et opportunités de carrière." },
];

const universities = [
  "UAC · Abomey-Calavi",
  "EPAC",
  "Université de Parakou",
  "ENEAM",
  "IUT Lokossa",
  "ESGIS",
  "Bénin Excellence",
  "IFRI",
  "HECM",
  "ENSTIC",
];

const faq = [
  { q: "Comment fonctionne l'offre gratuite ?", a: "Les 20 premiers utilisateurs bénéficient d'une orientation GRATUITE sans se connecter ! Tant que cette promotion est active, vous pouvez faire votre orientation gratuitement en mode invité. Une fois les 20 orientations utilisées, la promotion se termine et il faudra se connecter et payer 200 FCFA pour faire une orientation." },
  { q: "Dois-je me connecter pour l'offre gratuite ?", a: "Non ! Tant que les 20 orientations gratuites ne sont pas terminées, vous pouvez faire votre orientation sans créer de compte ni vous connecter. C'est une offre découverte pour les premiers utilisateurs. Après la promotion, la connexion sera obligatoire." },
  { q: "Que se passe-t-il après les 20 orientations gratuites ?", a: "Une fois les 20 orientations gratuites utilisées, l'offre se termine. Vous verrez une page expliquant comment fonctionne Orient+ et vous invitant à vous connecter. Après connexion, chaque orientation coûtera 200 FCFA." },
  { q: "Mes données sont-elles protégées ?", a: "Toujours. Nous chiffrons tes informations, ne les revendons jamais et tu peux supprimer ton profil à tout moment." },
  { q: "Est-ce adapté à toutes les séries du BAC ?", a: "Oui, séries scientifiques, littéraires, technologiques et professionnelles — l'IA adapte ses recommandations à chaque profil." },
  { q: "Puis-je l'utiliser sur mobile ?", a: "Absolument. L'expérience est optimisée pour smartphone, tablette et ordinateur, avec un design pensé mobile-first." },
];
