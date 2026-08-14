import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { Button } from '../uikits/Button';
import { Input } from '../uikits/Input';
import './Auth.scss';
import API_BASE_URL from '../config/api';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      const { accessToken, refreshToken, user } = response.data;

      login(user, accessToken, refreshToken);
      toast.success('Connexion réussie');
      navigate('/home');
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Erreur lors de la connexion';
      
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
      } else if (error.response) {
        const backendError = error.response.data?.error;
        if (backendError === 'Invalid credentials') {
          errorMessage = 'Email ou mot de passe incorrect';
        } else if (backendError === 'Please verify your email first') {
          errorMessage = 'Veuillez vérifier votre email avant de vous connecter';
        } else if (backendError === 'Email and password are required') {
          errorMessage = 'Veuillez remplir tous les champs';
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
          <h1>Connexion</h1>
          <p>Connectez-vous à votre compte Orient+</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
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
            placeholder="Votre mot de passe"
          />

          <div className="form-actions">
            <Link to="/forgot-password" className="forgot-link">
              Mot de passe oublié ?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Pas encore inscrit ?{' '}
            <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
