import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useKKiaPay } from 'kkiapay-react';
import './PaymentModal.scss';
import API_BASE_URL from '../config/api';

const PaymentModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [sandbox, setSandbox] = useState(true);
  const { refreshAccessToken } = useAuth();
  const { openKkiapayWidget, addKkiapayListener, removeKkiapayListener } = useKKiaPay();

  // Handle Kkiapay widget events
  useEffect(() => {
    const successHandler = async (response) => {
      console.log('Payment successful:', response);
      toast.success('Paiement effectué avec succès !');
      
      // Use the transaction ID from Kkiapay response, not the frontend-generated one
      const kkiapayTransactionId = response.transactionId || response.transaction_id;
      console.log('Kkiapay transaction ID:', kkiapayTransactionId);
      
      // Verify payment with backend
      if (kkiapayTransactionId) {
        setVerifying(true);
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

          const verifyResponse = await axios.post(
            `${API_BASE_URL}api/payment/verify`,
            { transactionId: kkiapayTransactionId },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          console.log('Verify response:', verifyResponse.data);

          if (verifyResponse.data.verified) {
            toast.success('Paiement vérifié avec succès !');
            onSuccess();
            onClose();
          } else {
            toast.error('Erreur lors de la vérification du paiement');
          }
        } catch (error) {
          console.error('Payment verification failed:', error);
          toast.error('Erreur lors de la vérification du paiement');
        } finally {
          setVerifying(false);
        }
      }
    };
    
    const failureHandler = (error) => {
      console.error('Payment failed:', error);
      toast.error('Paiement échoué. Veuillez réessayer.');
    };

    addKkiapayListener('success', successHandler);
    addKkiapayListener('failed', failureHandler);
    
    return () => {
      removeKkiapayListener('success', successHandler);
      removeKkiapayListener('failed', failureHandler);
    };
  }, [addKkiapayListener, removeKkiapayListener]);

  const handlePayment = async () => {
    setLoading(true);
    console.log('=== PAYMENT CLICKED ===');

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
        `${API_BASE_URL}api/payment/init`,
        { amount: 200 },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Backend response:', response.data);
      console.log('hasPaid:', response.data.hasPaid);
      console.log('publicKey:', response.data.publicKey);
      console.log('sandbox:', response.data.sandbox);

      if (response.data.hasPaid) {
        toast.success('Paiement déjà effectué !');
        onSuccess();
        onClose();
        return;
      }

      // Get public key from backend
      if (!response.data.publicKey) {
        console.error('Clé publique manquante dans la réponse backend');
        toast.error('Erreur de configuration du paiement - clé publique manquante');
        setLoading(false);
        return;
      }

      // Don't generate transaction ID - let Kkiapay handle it
      setPublicKey(response.data.publicKey);
      setSandbox(response.data.sandbox);
      
      console.log('Opening Kkiapay widget');
      console.log('Public key:', response.data.publicKey);
      console.log('Sandbox:', response.data.sandbox);
      
      // Open Kkiapay widget in-page - let Kkiapay generate the transaction ID
      openKkiapayWidget({
        amount: 200,
        api_key: response.data.publicKey,
        sandbox: response.data.sandbox,
        currency: 'XOF',
      });
      
      toast.info('Widget de paiement ouvert. Effectuez le paiement.');
      setLoading(false);
    } catch (error) {
      console.error('Payment check failed:', error);
      
      let errorMessage = 'Erreur lors de l\'initialisation du paiement';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
      } else if (error.response) {
        const backendError = error.response.data?.error;
        if (backendError) {
          errorMessage = backendError;
        } else {
          errorMessage = `Erreur serveur : ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion.';
      }
      
      toast.error(errorMessage);
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
                disabled={loading || verifying}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading || verifying ? 'Traitement en cours...' : 'Payer 200 FCFA'}
              </motion.button>

              <p className="payment-note">
                Paiement sécurisé via Kkiapay
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;
