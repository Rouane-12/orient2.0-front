import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../uikits/Button';
import { Input } from '../uikits/Input';
import './Auth.scss';
import API_BASE_URL from '../config/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}api/auth/forgot-password`, {
        email: formData.email
      });

      toast.success('Code de réinitialisation envoyé par email');
      setStep(2);
    } catch (error) {
      console.error('Send OTP error:', error);
      
      let errorMessage = 'Erreur lors de l\'envoi du code';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
      } else if (error.response) {
        const backendError = error.response.data?.error;
        if (backendError === 'User not found') {
          errorMessage = 'Aucun compte trouvé avec cet email.';
        } else if (backendError === 'Email is required') {
          errorMessage = 'Veuillez entrer votre email.';
        } else {
          errorMessage = backendError || 'Erreur serveur. Réessayez plus tard.';
        }
      } else if (error.request) {
        errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    console.log('Reset password called with:', formData);
    setLoading(true);

    try {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      console.log('Sending reset password request...');
      const response = await axios.post(`${API_BASE_URL}api/auth/reset-password`, {
        email: formData.email,
        code: formData.otp,
        newPassword: formData.newPassword
      });
      console.log('Reset password response:', response);

      toast.success('Mot de passe réinitialisé avec succès');
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Erreur lors de la réinitialisation';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
      } else if (error.response) {
        const backendError = error.response.data?.error;
        if (backendError === 'Invalid or expired code') {
          errorMessage = 'Code invalide ou expiré. Demandez un nouveau code.';
        } else if (backendError === 'Password must be at least 6 characters') {
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères.';
        } else if (backendError === 'All fields are required') {
          errorMessage = 'Veuillez remplir tous les champs.';
        } else {
          errorMessage = backendError || 'Erreur serveur. Réessayez plus tard.';
        }
      } else if (error.request) {
        errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}api/auth/send-otp`, {
        email: formData.email,
        type: 'password_reset'
      });

      toast.success('Nouveau code envoyé');
    } catch (error) {
      console.error('Resend OTP error:', error);
      
      let errorMessage = 'Erreur lors de l\'envoi du code';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
      } else if (error.response) {
        const backendError = error.response.data?.error;
        if (backendError === 'Please wait 1 minute before requesting a new code') {
          errorMessage = 'Attendez 1 minute avant de demander un nouveau code.';
        } else if (backendError === 'User not found') {
          errorMessage = 'Utilisateur non trouvé. Veuillez vous inscrire.';
        } else {
          errorMessage = backendError || 'Erreur serveur. Réessayez plus tard.';
        }
      } else if (error.request) {
        errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-brand">
          <h2>Orient<span style={{ color: '#ffb37a' }}>+</span></h2>
        </div>
        <div className="auth-header">
          <h1>{step === 1 ? 'Mot de passe oublié' : 'Réinitialiser le mot de passe'}</h1>
          <p>{step === 1 ? 'Entrez votre email pour recevoir un code' : 'Entrez le code et votre nouveau mot de passe'}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="auth-form">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="votre@email.com"
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              {loading ? 'Envoi en cours...' : 'Envoyer le code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="auth-form">
            <Input
              label="Code OTP"
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
              placeholder="Entrez le code à 6 chiffres"
              maxLength={6}
              className="otp-input"
            />

            <Input
              label="Nouveau mot de passe"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Minimum 6 caractères"
              minLength={6}
            />

            <Input
              label="Confirmer le mot de passe"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Répétez le mot de passe"
              minLength={6}
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              disabled={loading}
            >
              Renvoyer le code
            </Button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            <Link to="/login">Retour à la connexion</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
