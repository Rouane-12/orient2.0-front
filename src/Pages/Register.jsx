import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import './Auth.scss';

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
      toast.error(error.response?.data?.error || 'Erreur lors de l\'inscription');
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
      toast.error(error.response?.data?.error || 'Code OTP invalide');
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
      toast.error(error.response?.data?.error || 'Erreur lors de l\'envoi du code');
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
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                required
                placeholder="Votre prénom"
              />
            </div>

            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                required
                placeholder="Votre nom"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
              />
            </div>

            <div className="form-group">
              <label>Mot de passe</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Minimum 6 caractères"
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <div className="password-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Répétez le mot de passe"
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="auth-form">
            <div className="form-group">
              <label>Code OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
                placeholder="Entrez le code à 6 chiffres"
                maxLength={6}
                className="otp-input"
              />
            </div>

            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </motion.button>

            <button
              type="button"
              className="btn-link"
              onClick={handleResendOTP}
              disabled={loading}
            >
              Renvoyer le code
            </button>
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
