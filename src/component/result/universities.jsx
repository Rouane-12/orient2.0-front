import axios from "axios";
import { useEffect, useState } from "react";
import { SvgSpinners6DotsRotate, PhArrowDown } from "../../uikits/Icons";
import html2canvas from "html2canvas";
import { toast } from 'sonner';
import API_BASE_URL from '../../config/api';

export default function OneSectorUniversities({ sectorId }) {

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();

  const captureScreenshot = async () => {
    const element = document.getElementById('universities-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = 'universites-recommandees.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Erreur lors de la capture:', error);
      alert('Erreur lors de la capture');
    }
  };


  useEffect(() => {
    axios.get(`${API_BASE_URL}api/university/all-for/` + sectorId)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('Erreur récupération universités:', err);
        
        let errorMessage = 'Erreur lors du chargement des universités';
        
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
      .finally(() => setLoading(false))
  }, []);


  if (loading) {
    return (
      <div className="loader">
        <SvgSpinners6DotsRotate />
        <p>Chargement...</p>
      </div>
    );
  }


  return <div className="sectorUniversies flex f-col" id="universities-content">
    <button onClick={captureScreenshot} className="btn-download-universities btn-download-absolute-popup">
      <PhArrowDown />
      Capture
    </button>
    {
      data.map((item, i) => <article key={item._id || i} className="su-university">
        <b>{item.name} </b>
        <span>{item.industry} </span>
        <p>
          <strong>Description: <br /></strong>
          {item.description}
        </p>
        {item.contact && (
          <div className="su-contact">
            {item.contact.telephone && (
              <p><strong>Téléphone: </strong>{item.contact.telephone}</p>
            )}
            {item.contact.email && (
              <p><strong>Email: </strong>{item.contact.email}</p>
            )}
            {item.contact.site_web && (
              <p><strong>Site web: </strong><a href={item.contact.site_web} target="_blank" rel="noopener noreferrer">{item.contact.site_web}</a></p>
            )}
          </div>
        )}
        {item.secteur === 'public' && (
          <a 
            href="https://enseignementsuperieur.gouv.bj/actualite/show/ACT-kPEa9EFx-E3A054D" 
            target="_blank" 
            rel="noopener noreferrer"
            className="su-orientation-btn"
          >
            Guide d'orientation
          </a>
        )}
      </article>)
    }
  </div>;
}