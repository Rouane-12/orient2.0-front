import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PhCheckCircleFill, SvgSpinners6DotsRotate, PhArrowDown } from "../uikits/Icons";
import useModalStore from "../stores/modal";
import OneSectorUniversities from "../component/result/universities";
import Roadmap from "../component/result/roadmap";
import html2canvas from "html2canvas";
import { toast } from 'sonner';
import API_BASE_URL from '../config/api';

const GuestResultat = () => {
  const { guestId } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [position, setPosition] = useState(null);
  const { openModal } = useModalStore();
  const navigate = useNavigate();

  const captureScreenshot = async (elementId, fileName) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Erreur lors de la capture:', error);
      alert('Erreur lors de la capture');
    }
  };

  const downloadSectorScreenshot = (sector, index) => {
    const elementId = `sector-${index}`;
    captureScreenshot(elementId, `filiere-${sector.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`);
  };

  const downloadAllScreenshot = () => {
    captureScreenshot('result-content', 'orientation-resultats');
  };

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}api/guest-orientation/get-result/` + guestId)
      .then((res) => {
        setData(res.data);
        setPosition(res.data.position);
      })
      .catch((err) => {
        console.error(err);
        
        let errorMessage = "Erreur lors du chargement des résultats";
        
        if (err.code === 'ERR_NETWORK') {
          errorMessage = "Erreur de connexion au serveur. Vérifiez votre connexion internet.";
        } else if (err.response) {
          const backendError = err.response.data?.error;
          if (backendError === 'Données d\'orientation introuvables') {
            errorMessage = "Résultats introuvables. Veuillez refaire votre orientation.";
          } else {
            errorMessage = backendError || "Erreur serveur. Réessayez plus tard.";
          }
        } else if (err.request) {
          errorMessage = "Le serveur ne répond pas. Vérifiez votre connexion.";
        }
        
        toast.error(errorMessage);
      })
      .finally(() => setLoading(false));
  }, [guestId]);

  const showAllSectorUniversities = (sectorId) => {
    openModal(<OneSectorUniversities sectorId={sectorId} />);
  };

  const showRoadmap = (sectorId) => {
    openModal(<Roadmap sectorId={sectorId} />);
  };

  if (loading) {
    return (
      <>
        <div className="loader">
          <div className=".loader-section">
            <SvgSpinners6DotsRotate />
            <p>Chargement des résultats…</p>
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return <p>Pas de données disponibles</p>;
  }

  return (
    <div className="result" id="result-content">
      <div className="result-left">
        <div className="result-left__icon">
          <PhCheckCircleFill />
        </div>
        <div className="result-left__content">
          <h2>Félicitations !</h2>
          <p>Votre parcours d'orientation est complet</p>
          {position && (
            <p style={{ color: '#ffb37a', fontWeight: 'bold', marginTop: '10px' }}>
              Orientation gratuite #{position}
            </p>
          )}
        </div>
      </div>

      <div className="result-right">
        <div className="result-header">
          <div>
            <h1>Vos résultats d'orientation</h1>
            <p style={{ color: '#000000', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)', fontWeight: '500' }}>Nos recommandations personnalisées basées sur votre profil</p>
          </div>
          <button onClick={downloadAllScreenshot} className="btn-download">
            <PhArrowDown />
            Télécharger
          </button>
        </div>

        <div className="rr-sectors">
          {data.sectors.map((item, i) => (
            <section key={item._id} id={`sector-${i}`} className="sector-card">
              <div className="sector-card__header">
                <h3>{item.name}</h3>
                <div className="sector-card__percent">
                  <span className="percent-value">{item.percent}%</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              </div>

              {item.outlet && item.outlet.length > 0 && (
                <div className="sector-card__outlets">
                  <strong>Débouchés</strong>
                  <div className="outlets-list">
                    {item.outlet.map((ot, j) => (
                      <span key={j} className="outlet-tag">{ot}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="sector-card__actions">
                <button
                  onClick={() => showAllSectorUniversities(item._id)}
                  className="btn btn-primary"
                >
                  Voir les universités
                </button>

                <button
                  onClick={() => downloadSectorScreenshot(item, i)}
                  className="btn btn-secondary"
                >
                  <PhArrowDown />
                  Capture
                </button>
              </div>
            </section>
          ))}
        </div>

        <div className="result-footer">
          <button className="btn btn-normal" onClick={() => navigate('/')}>
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestResultat;
