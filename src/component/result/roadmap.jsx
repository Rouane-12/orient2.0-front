import axios from "axios";
import { useEffect, useState } from "react";
import { SvgSpinners6DotsRotate } from "../../uikits/Icons";
import { toast } from 'sonner';
import API_BASE_URL from '../../config/api';

export default function Roadmap({ sectorId, sectorName, userProfile }) {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState();
  const [source, setSource] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');

    axios.post(`${API_BASE_URL}api/orientation/generate-roadmap`, {
      sectorId,
      sectorName,
      userProfile: userProfile || {}
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setRoadmap(res.data.roadmap);
        setSource(res.data.source);
      })
      .catch((err) => {
        console.error('Erreur génération roadmap:', err);

        let errorMessage = 'Erreur lors de la génération de la roadmap';

        if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
        } else if (err.response) {
          const backendError = err.response.data?.error;
          if (backendError) {
            errorMessage = backendError;
          } else {
            errorMessage = `Erreur serveur : ${err.response.status}`;
          }
        } else if (err.request) {
          errorMessage = 'Le serveur ne répond pas. Vérifiez votre connexion.';
        }

        toast.error(errorMessage);
      })
      .finally(() => setLoading(false));
  }, [sectorId, sectorName, userProfile]);


  if (loading) {
    return (
      <div className="loader">
        <SvgSpinners6DotsRotate />
        <p>Génération de la roadmap en cours...</p>
      </div>
    );
  }

  if (!roadmap) {
    return <p>Impossible de générer la roadmap pour le moment.</p>;
  }

  return (
    <div className="sectorroadmap flex f-col">
      {source && (
        <div style={{ marginBottom: '1rem', fontSize: '0.85rem', color: '#666' }}>
          Source: {source === 'openai' ? 'OpenAI' : source === 'perplexity' ? 'Perplexity' : 'Fallback'}
        </div>
      )}
      <article className="roadmap">
        <div dangerouslySetInnerHTML={{ __html: roadmap }} />
      </article>
    </div>
  );
}
