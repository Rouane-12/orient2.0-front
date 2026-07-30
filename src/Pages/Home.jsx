import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, useScroll, useInView, animate, AnimatePresence } from "framer-motion";
import {
  Sparkles, Compass, GraduationCap, Brain, Rocket, ShieldCheck,
  ArrowRight, Play, ChevronDown, Star, Bell, TrendingUp, MapPin, Menu, X, LogOut,
} from "lucide-react";
import s from "../style/HomeNew.module.css";
import ReviewForm from "../component/ReviewForm";
import MyReviews from "../component/MyReviews";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stats, setStats] = useState({ students_accompanied: 0, satisfaction_rate: 0, universities_partners: 40, sectors_indexed: 250 });
  const [reviews, setReviews] = useState([]);
  const [showMyReviews, setShowMyReviews] = useState(false);
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
        const response = await fetch('http://localhost:5200/api/statistics');
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
        const response = await fetch('http://localhost:5200/api/reviews');
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  const handleReviewSubmitted = () => {
    // Refetch reviews after a new one is submitted
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:5200/api/reviews');
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
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
            <a onClick={() => navigate('/mes-orientations')}>Mes Orientations</a>
            <a onClick={() => navigate('/step')}>Commencer</a>
            <button 
              className={s.logoutBtn}
              onClick={() => {
                logout();
                navigate('/welcome');
              }}
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
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
                <a onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate('/mes-orientations'); }}>Mes Orientations</a>
                <a onClick={(e) => { e.preventDefault(); setMenuOpen(false); navigate('/step'); }}>Commencer</a>
                <button 
                  className={s.mobileLogoutBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    setMenuOpen(false);
                    logout();
                    navigate('/welcome');
                  }}
                >
                  <LogOut size={18} />
                  <span>Déconnexion</span>
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className={s.hero}>
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
                Trouve ta voie
                <span className={s.titleAccent}> en quelques étapes simples.</span>
              </h1>
              <p className={s.subtitle}>
                "Grâce à notre plateforme d'orientation, découvre les filières, métiers et parcours qui te correspondent vraiment. Que tu sois étudiant, lycéen ou en reconversion, on t'accompagne pour faire les bons choix, en toute confiance."
              </p>
              <div className={s.heroCtas}>
                <MagneticButton primary onClick={() => navigate('/step')}>
                  Commencer gratuitement <ArrowRight size={16} />
                </MagneticButton>
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

            <PhoneMockup />
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
            <StatCard value={stats.satisfaction_rate} suffix="%" label="Satisfaction" />
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
                // If there are reviews but less than 3, show them without duplication
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
                // Default testimonials with duplication for infinite marquee
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
                  {/* Duplicate for infinite marquee */}
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
          <div style={{ marginTop: '3rem' }}>
            <button 
              onClick={() => setShowMyReviews(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fafafa',
                padding: '0.75rem 1.5rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                marginBottom: '1.5rem',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              Gérer mes avis
            </button>
            <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
          </div>
        </div>
      </section>

      <section className={s.section} style={{ paddingTop: 40 }}>
        <div className={s.container}>
          <SectionHead eyebrow="FAQ" title="Les questions qu'on nous pose." />
          <div className={s.faq}>
            {faq.map((q) => <FaqItem key={q.q} q={q.q} a={q.a} />)}
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
              <MagneticButton primary onClick={() => navigate('/step')}>
                Commencer maintenant <ArrowRight size={16} />
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {showMyReviews && <MyReviews onClose={() => setShowMyReviews(false)} />}
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
  { q: "Orient+ est-il gratuit ?", a: "Oui, la découverte et les recommandations essentielles sont 100% gratuites. Des options premium existent pour un accompagnement approfondi." },
  { q: "Mes données sont-elles protégées ?", a: "Toujours. Nous chiffrons tes informations, ne les revendons jamais et tu peux supprimer ton profil à tout moment." },
  { q: "Est-ce adapté à toutes les séries du BAC ?", a: "Oui, séries scientifiques, littéraires, technologiques et professionnelles — l'IA adapte ses recommandations à chaque profil." },
  { q: "Puis-je l'utiliser sur mobile ?", a: "Absolument. L'expérience est optimisée pour smartphone, tablette et ordinateur, avec un design pensé mobile-first." },
];