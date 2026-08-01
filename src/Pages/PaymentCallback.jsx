import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import './PaymentCallback.scss';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const transaction_id = urlParams.get('transaction_id');
    
    if (transaction_id) {
      setTransactionId(transaction_id);
      checkPaymentStatus(transaction_id);
    } else {
      setStatus('error');
      setTimeout(() => navigate('/'), 3000);
    }
  }, [navigate]);

  const checkPaymentStatus = async (transactionId) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(
        `${API_BASE_URL}api/payment/status/${transactionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        setStatus('success');
        toast.success('Paiement réussi !');
        setTimeout(() => navigate('/step'), 2000);
      } else if (response.data.status === 'failed') {
        setStatus('failed');
        toast.error('Le paiement a échoué');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setStatus('pending');
        setTimeout(() => checkPaymentStatus(transactionId), 3000);
      }
    } catch (error) {
      setStatus('error');
      toast.error('Erreur lors de la vérification du paiement');
      setTimeout(() => navigate('/'), 3000);
    }
  };

  return (
    <div className="payment-callback-container">
      <motion.div
        className="payment-callback-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {status === 'loading' && (
          <div className="callback-status loading">
            <div className="spinner"></div>
            <h2>Vérification du paiement...</h2>
            <p>Veuillez patienter pendant que nous vérifions votre transaction.</p>
          </div>
        )}

        {status === 'pending' && (
          <div className="callback-status pending">
            <div className="spinner"></div>
            <h2>Paiement en cours...</h2>
            <p>La transaction est en cours de traitement.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="callback-status success">
            <div className="success-icon">✓</div>
            <h2>Paiement réussi !</h2>
            <p>Redirection vers la génération de votre orientation...</p>
          </div>
        )}

        {status === 'failed' && (
          <div className="callback-status failed">
            <div className="failed-icon">✗</div>
            <h2>Paiement échoué</h2>
            <p>Une erreur s'est produite lors du paiement. Vous allez être redirigé.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="callback-status error">
            <div className="error-icon">!</div>
            <h2>Erreur</h2>
            <p>Une erreur inattendue s'est produite. Vous allez être redirigé.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentCallback;
