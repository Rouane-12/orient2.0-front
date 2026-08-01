import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import './PaymentModal.scss';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { refreshAccessToken } = useAuth();

  useEffect(() => {
    // Add Kkiapay success listener
    console.log('Setting up Kkiapay listeners...');
    if (window.addSuccessListener) {
      const successHandler = async (response) => {
        console.log('Kkiapay payment success:', response);
        try {
          let token = localStorage.getItem('accessToken');
          
          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              token = newToken;
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }

          // Create transaction in backend
          await axios.post(
            'http://localhost:5200/api/payment/verify',
            { transactionId: response.transactionId },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          toast.success('Paiement réussi !');
          setLoading(false);
          onSuccess();
          onClose();
        } catch (error) {
          console.error('Payment verification failed:', error);
          toast.error('Erreur lors de la vérification du paiement');
          setLoading(false);
        }
      };

      const failureHandler = (error) => {
        console.log('Kkiapay payment failed:', error);
        toast.error('Paiement échoué. Veuillez réessayer.');
        setLoading(false);
      };

      window.addSuccessListener(successHandler);
      window.addFailedListener(failureHandler);
      console.log('Kkiapay listeners added successfully');

      return () => {
        if (window.removeSuccessListener) {
          window.removeSuccessListener(successHandler);
        }
        if (window.removeFailedListener) {
          window.removeFailedListener(failureHandler);
        }
      };
    } else {
      console.log('window.addSuccessListener not available');
    }
  }, [refreshAccessToken, onSuccess, onClose]);

  const handlePayment = async () => {
    setLoading(true);
    console.log('=== PAYMENT CLICKED ===');
    console.log('window.openKkiapayWidget:', typeof window.openKkiapayWidget);
    console.log('window.kkiapay:', typeof window.kkiapay);

    try {
      let token = localStorage.getItem('accessToken');
      
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          token = newToken;
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // Check if user already paid
      const response = await axios.post(
        'http://localhost:5200/api/payment/init',
        { amount: 200 },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Backend response:', response.data);

      if (response.data.hasPaid) {
        toast.success('Paiement déjà effectué');
        onSuccess();
        onClose();
        setLoading(false);
        return;
      }

      // Open Kkiapay widget using CDN global function
      console.log('Attempting to open Kkiapay widget...');
      if (window.openKkiapayWidget) {
        console.log('openKkiapayWidget is available, calling it...');
        window.openKkiapayWidget({
          amount: 200,
          api_key: '2e2c8f308b7611f19e0eb124a388c3f8',
          sandbox: true,
          data: '',
          theme: '#0095ff',
          position: 'center',
          container: '#kkiapay-container'
        });
        console.log('openKkiapayWidget called');
      } else {
        console.error('Kkiapay script not loaded');
        toast.error('Kkiapay script not loaded');
        setLoading(false);
      }
    } catch (error) {
      console.error('Payment check failed:', error);
      toast.error('Erreur lors de la vérification du paiement');
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="payment-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="payment-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payment-modal-header">
              <h2>Paiement requis</h2>
              <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="payment-modal-content">
              <div className="payment-info">
                <div className="payment-icon">💳</div>
                <h3>Génération d'orientation IA</h3>
                <p className="payment-description">
                  Pour générer votre orientation personnalisée avec notre IA, 
                  un paiement unique de 200 FCFA est requis.
                </p>
                <p className="payment-note-important">
                  ⚠️ Après le paiement, vous devrez renvoyer le formulaire pour voir votre orientation.
                </p>
                <div className="payment-price">
                  <span className="amount">200 FCFA</span>
                  <span className="label">Paiement unique</span>
                </div>
              </div>

              <div className="payment-features">
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Orientation personnalisée</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Analyse par IA</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span>Résultats détaillés</span>
                </div>
              </div>

              <motion.button
                className="payment-btn"
                onClick={handlePayment}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Chargement...' : 'Payer 200 FCFA'}
              </motion.button>

              <p className="payment-note">
                Paiement sécurisé via Kkiapay Sandbox
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
