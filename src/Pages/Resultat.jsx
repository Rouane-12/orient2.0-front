import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { PhCheckCircleFill, SvgSpinners6DotsRotate, PhArrowDown } from "../uikits/Icons";
import ProgressBar from "@ramonak/react-progress-bar";
import useModalStore from "../stores/modal";
import OneSectorUniversities from "../component/result/universities";
import Roadmap from "../component/result/roadmap";
import html2canvas from "html2canvas";
import { toast } from 'sonner';
import API_BASE_URL from '../config/api';

const Resultat = () => {
  const { orientId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const { openModal } = useModalStore();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/step');
  }

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
    // Check if orientation data is passed from MyOrientations page
    if (location.state?.orientationData) {
      setData(location.state.orientationData.data);
      setLoading(false);
      return;
    }

    // Check if orientation exists in localStorage history
    const history = JSON.parse(localStorage.getItem('orienta_history') || '[]');
    const existingOrientation = history.find(o => o.id === orientId);
    
    if (existingOrientation && existingOrientation.data) {
      setData(existingOrientation.data);
      setLoading(false);
      return;
    }

    // Otherwise fetch from API
    const token = localStorage.getItem('accessToken');
    axios
      .get(`${API_BASE_URL}api/orientation/get-result/` + orientId, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setData(res.data);
        // Save orientation to localStorage
        saveOrientationToHistory(res.data, orientId);
      })
      .catch((err) => {
        console.error(err);
        
        let errorMessage = "Erreur lors du chargement des résultats";
        
        if (err.code === 'ERR_NETWORK') {
          errorMessage = "Erreur de connexion au serveur. Vérifiez votre connexion internet.";
        } else if (err.response) {
          const backendError = err.response.data?.error;
          if (backendError === 'Données d\'orientation introuvables' || err.response.status === 404) {
            errorMessage = "Résultats introuvables. Cette orientation n'existe plus ou a été supprimée. Veuillez faire une nouvelle orientation.";
            // Remove invalid orientation from localStorage
            const updatedHistory = history.filter(o => o.id !== orientId);
            localStorage.setItem('orienta_history', JSON.stringify(updatedHistory));
          } else {
            errorMessage = backendError || "Erreur serveur. Réessayez plus tard.";
          }
        } else if (err.request) {
          errorMessage = "Le serveur ne répond pas. Vérifiez votre connexion.";
        }
        
        toast.error(errorMessage);
      })
      .finally(() => setLoading(false));
  }, [orientId, location.state]);

  const saveOrientationToHistory = (orientationData, id) => {
    try {
      // Only save if we have valid data and a valid ID
      if (!orientationData || !orientationData.sectors || !id) {
        console.warn('Invalid orientation data or ID, not saving to history');
        return;
      }

      const history = JSON.parse(localStorage.getItem('orienta_history') || '[]');
      
      // Check if this orientation already exists
      const existingIndex = history.findIndex(o => o.id === id);
      
      const orientationEntry = {
        id: id,
        date: new Date().toISOString(),
        data: orientationData
      };
      
      if (existingIndex >= 0) {
        // Update existing entry, preserve date if it exists and is valid
        const existingEntry = history[existingIndex];
        if (existingEntry.date && !isNaN(new Date(existingEntry.date))) {
          orientationEntry.date = existingEntry.date;
        }
        history[existingIndex] = orientationEntry;
      } else {
        // Add new entry
        history.push(orientationEntry);
      }
      
      // Keep only last 20 orientations
      const trimmedHistory = history.slice(-20);
      
      localStorage.setItem('orienta_history', JSON.stringify(trimmedHistory));
      console.log('Orientation saved to history:', id);
    } catch (error) {
      console.error('Error saving orientation to history:', error);
    }
  };

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
        </div>
      </div>

      <div className="result-right">
        <div className="result-header">
          <div>
            <h1>Vos résultats d'orientation</h1>
            <p style={{ color: '#151515', fontWeight: '500' }}>Nos recommandations personnalisées basées sur votre profil</p>
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
          <button className="btn btn-normal" onClick={() => navigate(-1)}>
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default Resultat;
