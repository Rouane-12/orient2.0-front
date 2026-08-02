import axios from "axios";
import { useEffect, useState } from "react";
import { SvgSpinners6DotsRotate } from "../../uikits/Icons";
import { toast } from 'sonner';
import API_BASE_URL from '../../config/api';

export default function Roadmap({ sectorId }) {
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState();

  useEffect(() => {
    axios.get(`${API_BASE_URL}api/roadmap/get-roadmap/` + sectorId)
      .then((res) => {
        setRoadmap(res.data.roadmap); // ✅ CORRECTION ICI
      })
      .catch((err) => {
        console.error('Erreur récupération roadmap:', err);
        
        let errorMessage = 'Erreur lors du chargement de la roadmap';
        
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
  }, [sectorId]);


  if (loading) {
    return (
      <div className="loader">
        <SvgSpinners6DotsRotate />
        <p>Chargement...</p>
      </div>
    );
  }

  if (!roadmap) {
    return <p>Aucune roadmap trouvée.</p>;
  }

  return (
    <div className="sectorroadmap flex f-col">
      <article className="roadmap">
        <p>
          <div dangerouslySetInnerHTML={{ __html: roadmap.htmlContent }} />
        </p>
      </article>
    </div>
  );
}
