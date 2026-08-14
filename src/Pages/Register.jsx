import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../uikits/Button';
import { Input } from '../uikits/Input';
import './Auth.scss';
import API_BASE_URL from '../config/api';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        setLoading(false);
        return;
      }

      await axios.post(`${API_BASE_URL}api/auth/register`, {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password
      });

      toast.success('Compte créé avec succès. Vérifiez votre email pour le code OTP.');
      setStep(2);
    } catch (error) {
      console.error('Register error:', error);
      
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
      } else if (error.response) {
        const backendError = error.response.data?.error;
        if (backendError === 'Email already registered') {
          errorMessage = 'Cet email est déjà utilisé. Connectez-vous ou utilisez un autre email.';
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

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}api/auth/verify-otp`, {
        email: formData.email,
        code: formData.otp,
        type: 'registration'
      });

      toast.success('Email vérifié avec succès. Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } catch (error) {
      console.error('Verify OTP error:', error);
      
      let errorMessage = 'Code OTP invalide';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
      } else if (error.response) {
        const backendError = error.response.data?.error;
        if (backendError === 'Invalid or expired code') {
          errorMessage = 'Code invalide ou expiré. Demandez un nouveau code.';
        } else if (backendError === 'Maximum attempts exceeded') {
          errorMessage = 'Trop de tentatives. Demandez un nouveau code.';
        } else if (backendError === 'Email, code and type are required') {
          errorMessage = 'Veuillez entrer le code OTP.';
        } else {
          errorMessage = backendError || 'Erreur lors de la vérification.';
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
        type: 'registration'
      });

      toast.success('Nouveau code OTP envoyé');
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
        } else if (backendError === 'Email already verified') {
          errorMessage = 'Email déjà vérifié. Connectez-vous.';
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
          <h1>{step === 1 ? 'Créer un compte' : 'Vérifier votre email'}</h1>
          <p>{step === 1 ? 'Rejoignez Orient+ pour votre orientation' : 'Entrez le code envoyé par email'}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleRegister} className="auth-form">
            <Input
              label="Prénom"
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              required
              placeholder="Votre prénom"
            />

            <Input
              label="Nom"
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              required
              placeholder="Votre nom"
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="votre@email.com"
            />

            <Input
              label="Mot de passe"
              type="password"
              name="password"
              value={formData.password}
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
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <Input
              label="Code OTP"
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
              placeholder="Entrez le code à 6 chiffres"
              maxLength={6}
              className="ota-input"
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              {loading ? 'Vérification...' : 'Vérifier'}
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
            Déjà inscrit ?{' '}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
