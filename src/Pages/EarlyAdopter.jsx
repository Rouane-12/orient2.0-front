import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Trophy, Star, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API_BASE_URL from '../config/api';

export default function EarlyAdopter() {
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimed, setClaimed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}api/free-orientation/check`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.canHaveFree) {
          setPosition(data.position);
        } else {
          // User doesn't qualify, redirect to home
          navigate('/home');
        }
      } catch (error) {
        console.error('Error checking status:', error);
        navigate('/home');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [navigate]);

  const handleClaim = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}api/free-orientation/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setClaimed(true);
        setTimeout(() => {
          navigate('/step');
        }, 2000);
      }
    } catch (error) {
      console.error('Error claiming free orientation:', error);
    }
  };

  const getOrdinalSuffix = (num) => {
    if (num === 1) return 'er';
    return 'e';
  };

  const getCelebrationMessage = (pos) => {
    if (pos === 1) return "🏆 FÉLICITATIONS ! Vous êtes le PREMIER !";
    if (pos === 2) return "🥈 INCROYABLE ! Vous êtes le DEUXIÈME !";
    if (pos === 3) return "🥉 FORMIDABLE ! Vous êtes le TROISIÈME !";
    return `🎉 BRAVO ! Vous êtes le ${pos}${getOrdinalSuffix(pos)} !`;
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        color: 'white'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles size={48} color="#ffb37a" />
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #2d1f3d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background elements */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(230, 112, 40, 0.3) 0%, transparent 70%)',
          borderRadius: '50%',
          top: '-100px',
          right: '-100px'
        }}
      />
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255, 179, 122, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          bottom: '-50px',
          left: '-50px'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          zIndex: 10
        }}
      >
        {/* Trophy icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          style={{
            marginBottom: '30px'
          }}
        >
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto',
            background: 'linear-gradient(135deg, #ffb37a 0%, #e67028 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 20px 60px rgba(230, 112, 40, 0.4)'
          }}>
            <Trophy size={60} color="white" />
          </div>
        </motion.div>

        {/* Main message */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: 'white',
            marginBottom: '20px',
            lineHeight: '1.2'
          }}
        >
          {getCelebrationMessage(position)}
        </motion.h1>

        {/* Position badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #e67028 0%, #ca5923 100%)',
            padding: '15px 40px',
            borderRadius: '50px',
            marginBottom: '30px',
            boxShadow: '0 10px 30px rgba(230, 112, 40, 0.3)'
          }}
        >
          <span style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'white'
          }}>
            #{position}
          </span>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            fontSize: '1.2rem',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}
        >
          Vous faites partie des 20 premiers utilisateurs d'Orient+ !<br />
          En récompense, votre première orientation est <strong style={{ color: '#ffb37a' }}>100% GRATUITE</strong> !
        </motion.p>

        {/* Stars decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '40px'
          }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.1
              }}
            >
              <Star size={24} fill="#ffb37a" color="#ffb37a" />
            </motion.div>
          ))}
        </motion.div>

        {/* Action button */}
        {!claimed ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClaim}
            style={{
              background: 'linear-gradient(135deg, #ffb37a 0%, #e67028 100%)',
              border: 'none',
              padding: '18px 48px',
              borderRadius: '50px',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 15px 40px rgba(230, 112, 40, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '0 auto'
            }}
          >
            <Sparkles size={20} />
            <span>Revendiquer mon orientation gratuite</span>
            <ArrowRight size={20} />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'rgba(76, 175, 80, 0.2)',
              border: '2px solid #4CAF50',
              padding: '20px 40px',
              borderRadius: '50px',
              color: '#4CAF50',
              fontSize: '1.2rem',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <Sparkles size={24} />
            <span>Orientation gratuite revendiquée ! Redirection...</span>
          </motion.div>
        )}

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          style={{
            marginTop: '30px',
            fontSize: '0.9rem',
            color: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          Cette offre est limitée aux 20 premiers utilisateurs
        </motion.p>
      </motion.div>
    </div>
  );
}
