// En développement local, utiliser localhost
// En production, utiliser l'URL du backend depuis les variables d'environnement
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://orient2-0-back.onrender.com/';

// S'assurer que l'URL se termine par un slash
const normalizedUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;

export default normalizedUrl;
