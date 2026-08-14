import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import '../style/MultiStepForm.scss';
import ProgressBar from '../component/ProgressBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CustomInputCheckbox, CustomInputRadio } from '../uikits/form/choices';
import { CustomInputFile } from '../uikits/form/file';
import { SvgSpinners6DotsRotate } from '../uikits/Icons';
import { Button } from '../uikits/Button';
import PaymentModal from '../components/PaymentModal';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const config = {
  seconde: {
    private: [
      { label: "Bulletins Seconde (Trimestres)", fields: ["second_year_report_data_1", "second_year_report_data_2", "second_year_report_data_3"] },
      { label: "Bulletins Première (Trimestres)", fields: ["first_year_report_data_1", "first_year_report_data_2", "first_year_report_data_3"] },
      { label: "Bulletins Terminale (Trimestres)", fields: ["final_year_report_data_1", "final_year_report_data_2", "final_year_report_data_3"] },
    ],
    public: [
      { label: "Bulletins Seconde (Semestres)", fields: ["second_year_report_data_1", "second_year_report_data_2"] },
      { label: "Bulletins Première (Semestres)", fields: ["first_year_report_data_1", "first_year_report_data_2"] },
      { label: "Bulletins Terminale (Semestres)", fields: ["final_year_report_data_1", "final_year_report_data_2"] },
    ]
  },
  premiere: {
    private: [
      { label: "Bulletins Première (Trimestres)", fields: ["first_year_report_data_1", "first_year_report_data_2", "first_year_report_data_3"] },
      { label: "Bulletins Terminale (Trimestres)", fields: ["final_year_report_data_1", "final_year_report_data_2", "final_year_report_data_3"] },
    ],
    public: [
      { label: "Bulletins Première (Semestres)", fields: ["first_year_report_data_1", "first_year_report_data_2"] },
      { label: "Bulletins Terminale (Semestres)", fields: ["final_year_report_data_1", "final_year_report_data_2"] },
    ]
  },
  terminale: {
    private: [
      { label: "Bulletins Terminale (Trimestres)", fields: ["final_year_report_data_1", "final_year_report_data_2", "final_year_report_data_3"] },
    ],
    public: [
      { label: "Bulletins Terminale (Semestres)", fields: ["final_year_report_data_1", "final_year_report_data_2"] },
    ]
  }
};

const FILE_FIELDS = [
  "second_year_report_data_1",
  "second_year_report_data_2",
  "second_year_report_data_3",
  "first_year_report_data_1",
  "first_year_report_data_2",
  "first_year_report_data_3",
  "final_year_report_data_1",
  "final_year_report_data_2",
  "final_year_report_data_3",
  "final_exam_data"
];

function OrientationForm() {
  const TOTAL_STEPS = 7;
  const [orientationMode, setOrientationMode] = useState(null); // 'bulletins' or 'preferences'
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [userData, setUD] = useState();
  const [enums, setEnums] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [canHaveFreeOrientation, setCanHaveFreeOrientation] = useState(false);
  const filesRef = useRef({});

  // Fonction pour formater les labels (remplacer les underscores par des espaces)
  const formatEnumLabel = (value) => {
    return value.replace(/_/g, ' ');
  };
  const { user, refreshAccessToken } = useAuth();

  const { register, handleSubmit, reset, resetField, watch, getValues } = useForm({
    defaultValues: {
      upload_choice: '',
      interest_center: '',
      school_type: "",
      school_favorite_subject: [],
      skills: [],
      career_goals: [],
      personality_profile: "",
      like_external_langage: "",
      external_langages: [],
      constraints: "",
      work_style: "",
      work_environment: "",
      responsibility_level: "",
      learning_style: "",
      // Nouveaux champs pour meilleure détection de secteur
      social_engagement: "",
      research_interest: "",
      creative_interest: "",
      health_interest: "",
      legal_interest: "",
      agricultural_interest: "",
      business_interest: "",
    },
  });

  const selected = watch("upload_choice");
  const schoolType = watch("school_type");
  const likeLang = watch("like_external_langage");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnums = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}api/enums`);
        setEnums(res.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des enums', err);
      }
    };
    fetchEnums();
  }, []);

  useEffect(() => {
    // Payment check is now completely manual - no automatic checks
    // User will be prompted to pay when they try to submit the form
    setHasPaid(false);

    // Check if user can have free orientation
    const checkFreeOrientation = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE_URL}api/free-orientation/check`, {
          headers
        });
        const data = await response.json();
        if (data.canHaveFree) {
          setCanHaveFreeOrientation(true);
          setHasPaid(true); // Skip payment for free orientation users
        }
      } catch (error) {
        console.error('Error checking free orientation:', error);
      }
    };
    checkFreeOrientation();
  }, []);

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  // Cache for files to prevent ERR_UPLOAD_FILE_CHANGED
  const fileCache = useRef({});

  const extractAndSaveFiles = (data) => {
    FILE_FIELDS.forEach(field => {
      // Check if data has the field, and it's a FileList or array with a File
      const fieldData = data[field];
      if (fieldData) {
        // Handle both FileList and regular arrays
        const filesArray = Array.isArray(fieldData) ? fieldData : Array.from(fieldData);
        if (filesArray.length > 0 && filesArray[0] instanceof File) {
          const file = filesArray[0];
          // Cache file information and create a new File object to avoid errors
          const cachedFile = new File([file], file.name, { type: file.type });
          filesRef.current[field] = cachedFile;
          fileCache.current[field] = cachedFile;
        }
      } else if (fileCache.current[field]) {
        // Use cached file if available
        filesRef.current[field] = fileCache.current[field];
      }
      delete data[field];
    });
  };

  const onNext = async (data) => {
    extractAndSaveFiles(data);

    const updatedData = { ...formData, ...data };
    setFormData(updatedData);
    localStorage.setItem('orientationFormData', JSON.stringify(updatedData));

    // User data is already stored from registration, no need to create user again
    setStep(prev => prev + 1);
  };

  const onSubmit = async (data) => {
    if (!hasPaid) {
      setShowPaymentModal(true);
      return;
    }

    const finalData = { ...formData, ...data };

    // Mode preferences : pas de fichiers requis
    if (orientationMode === 'preferences') {
      setIsSubmitting(true);

      const payload = {
        userId: user.id,
        mode: 'preferences',
        interest_center: finalData.interest_center,
        school_type: finalData.school_type || 'both',
        school_favorite_subject: finalData.school_favorite_subject || [],
        skills: finalData.skills || [],
        career_goals: finalData.career_goals || [],
        personality_profile: finalData.personality_profile,
        like_external_langage: finalData.like_external_langage === 'true',
        external_langages: finalData.like_external_langage === 'true' ? finalData.external_langages || [] : [],
        constraints: finalData.constraints,
        work_style: finalData.work_style,
        work_environment: finalData.work_environment,
        responsibility_level: finalData.responsibility_level,
        learning_style: finalData.learning_style,
        // Nouveaux champs pour meilleure détection de secteur
        social_engagement: finalData.social_engagement,
        research_interest: finalData.research_interest,
        creative_interest: finalData.creative_interest,
        health_interest: finalData.health_interest,
        legal_interest: finalData.legal_interest,
        agricultural_interest: finalData.agricultural_interest,
        business_interest: finalData.business_interest
      };

      try {
        const token = localStorage.getItem('accessToken');
        const orientReq = await axios.post(`${API_BASE_URL}api/orientation/preferences-only`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (orientReq.data.success === false) {
          toast.error(orientReq.data.error || 'Erreur lors de la soumission');
          return;
        }

        toast.success('Orientation soumise avec succès !');
        navigate('/resultat/' + orientReq.data.orientId);
      } catch (err) {
        console.error("Erreur lors de l'envoi du formulaire :", err);
        toast.error("Une erreur est survenue lors de la soumission.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Mode bulletins : vérification des fichiers requise
    extractAndSaveFiles(data);

    // Déterminer les fichiers requis dynamiquement selon la configuration
    const uploadChoice = finalData.upload_choice;
    const schoolType = finalData.school_type;
    let requiredFiles = [];

    if (uploadChoice && config[uploadChoice]) {
      const typeConfig = config[uploadChoice][schoolType === 'both' ? 'private' : schoolType] || config[uploadChoice]['private'];
      typeConfig.forEach(section => {
        requiredFiles.push(...section.fields);
      });
    }

    // Ajouter toujours le relevé du BAC
    requiredFiles.push("final_exam_data");

    const missingFiles = requiredFiles.filter(field => !filesRef.current[field]);

    if (missingFiles.length > 0) {
      toast.error(`Fichiers manquants : ${missingFiles.join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      userId: user.id,
      mode: 'bulletins',
      interest_center: finalData.interest_center,
      school_type: finalData.school_type,
      school_favorite_subject: finalData.school_favorite_subject || [],
      skills: finalData.skills || [],
      career_goals: finalData.career_goals || [],
      personality_profile: finalData.personality_profile,
      like_external_langage: finalData.like_external_langage === 'true',
      external_langages: finalData.like_external_langage === 'true' ? finalData.external_langages || [] : [],
      constraints: finalData.constraints,
      work_style: finalData.work_style,
      work_environment: finalData.work_environment,
      responsibility_level: finalData.responsibility_level,
      learning_style: finalData.learning_style,
      // Nouveaux champs pour meilleure détection de secteur
      social_engagement: finalData.social_engagement,
      research_interest: finalData.research_interest,
      creative_interest: finalData.creative_interest,
      health_interest: finalData.health_interest,
      legal_interest: finalData.legal_interest,
      agricultural_interest: finalData.agricultural_interest,
      business_interest: finalData.business_interest
    };

    const payloadFormData = new FormData();

    for (const key in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        if (Array.isArray(payload[key])) {
          payload[key].forEach(element => payloadFormData.append(key, element));
        } else {
          payloadFormData.append(key, payload[key]);
        }
      }
    }

    FILE_FIELDS.forEach(field => {
      if (filesRef.current[field]) {
        payloadFormData.append(field, filesRef.current[field]);
      }
    });

    try {
      const token = localStorage.getItem('accessToken');
      const orientReq = await axios.post(`${API_BASE_URL}api/orientation`, payloadFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (orientReq.data.success === false) {
        if (orientReq.data.requiresPayment) {
          setShowPaymentModal(true);
          return;
        }
        toast.error(orientReq.data.error || 'Erreur lors de la soumission');
        return;
      }
      
      toast.success('Formulaire soumis avec succès !');
      navigate('/resultat/' + orientReq.data.orientId);
    } catch (err) {
      console.error("Erreur lors de l'envoi du formulaire :", err);

      let errorMessage = "Une erreur est survenue lors de la soumission.";

      if (err.code === 'ERR_NETWORK') {
        errorMessage = "Erreur de connexion au serveur. Vérifiez votre connexion internet.";
      } else if (err.message.includes('ERR_UPLOAD_FILE_CHANGED')) {
        errorMessage = "Erreur avec un fichier : Réessayez de sélectionner les fichiers avant de soumettre !";
      } else if (err.response) {
        const backendError = err.response.data?.error;
        if (backendError === 'Paiement requis') {
          errorMessage = "Paiement requis. Veuillez effectuer le paiement de 200 FCFA pour générer votre orientation.";
          setShowPaymentModal(true);
          return;
        } else if (backendError === 'Fichiers manquants') {
          errorMessage = "Fichiers manquants. Les bulletins finaux et le relevé de BAC sont requis.";
        } else if (backendError === 'Erreur lors du traitement des documents') {
          errorMessage = "Erreur lors du traitement des documents. Vérifiez que vos fichiers sont lisibles.";
        } else {
          errorMessage = backendError || `Erreur serveur : ${err.response.statusText} (${err.response.status})`;
        }
      } else if (err.request) {
        errorMessage = "Le serveur ne répond pas. Vérifiez votre connexion.";
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setHasPaid(true);
    setShowPaymentModal(false);
    // Automatically submit the form after payment success
    const currentValues = getValues();
    const finalData = { ...formData, ...currentValues };
    onSubmit(finalData);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  if (!enums) return (
    <div className="loader">
      <SvgSpinners6DotsRotate />
      <p>Chargement des données...</p>
    </div>
  );

  if (isSubmitting) return (
    <div className="loader">
      <SvgSpinners6DotsRotate />
      <p>Envoi du formulaire en cours...</p>
    </div>
  );

  return (
    <div className="form-container">
      <div className="image-side">
        <div className="image-side__bg"></div>
        <div className="image-side__content">
          <img src="/public/images/logo4.png" alt="" />
          <h2>Trouve ta voie</h2>
          <p>en quelques étapes simples</p>
          <div className="image-side__text">
            <p>
              "Grâce à notre plateforme d'orientation, découvre les filières, métiers et parcours qui te correspondent vraiment. Que tu sois étudiant, lycéen ou en reconversion, on t'accompagne pour faire les bons choix, en toute confiance."
            </p>
          </div>
        </div>
      </div>

      <div className="form-side">
        <div className="form-side__header">
          <h2 style={{ color: '#ffffff !important', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>Étape {step} sur {TOTAL_STEPS}</h2>
          <ProgressBar step={step} totalSteps={TOTAL_STEPS} />
        </div>

        {step === 1 && (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (orientationMode) {
              setStep(2);
            }
          }}>
            <h3>Choisissez votre mode d'orientation</h3>
            <p style={{ marginBottom: '20px' }}>Sélectionnez le mode qui correspond le mieux à votre situation :</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div 
                onClick={() => setOrientationMode('bulletins')}
                style={{
                  padding: '30px',
                  border: `2px solid ${orientationMode === 'bulletins' ? '#e67028' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  background: orientationMode === 'bulletins' ? 'rgba(230, 112, 40, 0.05)' : '#ffffff',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📄</div>
                <h4 style={{ marginBottom: '10px', color: '#151515' }}>Mode Bulletins</h4>
                <p style={{ fontSize: '0.9rem', color: '#626262', lineHeight: '1.5' }}>
                  Orientation basée sur l'analyse de vos bulletins scolaires et relevé de notes. Recommandé pour une analyse précise basée sur votre parcours académique.
                </p>
              </div>

              <div 
                onClick={() => setOrientationMode('preferences')}
                style={{
                  padding: '30px',
                  border: `2px solid ${orientationMode === 'preferences' ? '#e67028' : 'rgba(0, 0, 0, 0.1)'}`,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  background: orientationMode === 'preferences' ? 'rgba(230, 112, 40, 0.05)' : '#ffffff',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎯</div>
                <h4 style={{ marginBottom: '10px', color: '#151515' }}>Mode Préférences</h4>
                <p style={{ fontSize: '0.9rem', color: '#626262', lineHeight: '1.5' }}>
                  Orientation basée uniquement sur un questionnaire détaillé de vos préférences et intérêts. Idéal si vous n'avez pas vos bulletins sous la main.
                </p>
              </div>
            </div>

            <div className="button-group">
              <Button type="button" variant="secondary" onClick={handlePrevious} disabled>Précédent</Button>
              <Button type="submit" variant="primary" disabled={!orientationMode}>Suivant</Button>
            </div>
          </form>
        )}

        {step === 2 && orientationMode === 'bulletins' && (
          <form onSubmit={handleSubmit(onNext)}>
            <h3>Préférences et Documents scolaires</h3>
            <h3>Quel type d'université souhaitez vous frequentez ?</h3>
            <select {...register("school_type")} required>
              <option value="">Sélectionne une option</option>
              <option value="public">Public</option>
              <option value="private">Privé</option>
              <option value="both">Peu importe</option>
            </select>

            <CustomInputRadio register={register} name={"upload_choice"}
              label={'Souhaitez-vous renseigner :'}
              options={[
                { value: "seconde", label: "Vos Bulletins de Seconde à Terminale" },
                { value: "premiere", label: "Vos Bulletins de Première à Terminale" },
                { value: "terminale", label: "Vos Bulletin de Terminale uniquement" },
              ]}
            />

            {selected && schoolType && config[selected] && config[selected][schoolType === 'both' ? 'private' : schoolType]?.map((section, index) => (
              <div key={'section' + index}>
                <p>{section.label} :</p>
                {section.fields.map((field, idx) => (
                  <CustomInputFile key={'input file' + idx + field} register={register} name={field}
                    label={`Bulletin ${idx + 1}`}
                    watch={watch} resetField={resetField} require={{ required: 'Ce champ est requis' }} />
                ))}
              </div>
            ))}

            <CustomInputFile register={register} name={"final_exam_data"} label={"Relevé du Bac :"}
              watch={watch} resetField={resetField} require={{ required: 'Ce champ est requis' }} />

            <div style={{ marginTop: '3rem' }}></div>

            <div className="button-group">
              <Button type="button" variant="secondary" onClick={() => { setOrientationMode(null); setStep(1); }}>Précédent</Button>
              <Button type="submit" variant="primary">Suivant</Button>
            </div>
          </form>
        )}

        {step === 2 && orientationMode === 'preferences' && (
          <form onSubmit={handleSubmit(onNext)}>
            <h3>Centre d'intérêt</h3>
            <p style={{ marginBottom: '12px' }}>Quel est votre centre d'intérêt principal ?</p>
            <select {...register("interest_center")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              {enums.InterestCenterEnum.map((item, idx) => (
                <option key={idx} value={item}>{formatEnumLabel(item)}</option>
              ))}
              <option value="droit_et_justice">Droit et Justice</option>
              <option value="sciences_sociales">Sciences Sociales et Humaines</option>
              <option value="sante_et_medecine">Santé et Médecine</option>
              <option value="agriculture_et_environnement">Agriculture et Environnement</option>
              <option value="industrie_et_technologie">Industrie et Technologie</option>
              <option value="transport_et_logistique">Transport et Logistique</option>
              <option value="education_et_formation">Éducation et Formation</option>
              <option value="arts_et_culture">Arts et Culture</option>
              <option value="commerce_et_gestion">Commerce et Gestion</option>
              <option value="tourisme_et_hotellerie">Tourisme et Hôtellerie</option>
              <option value="energies_renouvelables">Énergies Renouvelables</option>
              <option value="construction_et_btp">Construction et BTP</option>
              <option value="artisanat">Artisanat</option>
              <option value="qhse">Qualité, Hygiène, Sécurité et Environnement</option>
              <option value="digital_et_tic">Numérique et TIC</option>
            </select>

            <CustomInputCheckbox register={register} name={"school_favorite_subject"}
              label={'Matières préférées (sélectionnez toutes celles qui vous intéressent) :'}
              options={[
                ...(enums.FavoriteSubjectsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))),
                { value: "mathematiques_avancees", label: "Mathématiques Avancées" },
                { value: "physique_chimie", label: "Physique-Chimie" },
                { value: "svt_biologie", label: "SVT / Biologie" },
                { value: "economie_gestion", label: "Économie et Gestion" },
                { value: "histoire_geographie", label: "Histoire-Géographie" },
                { value: "lettres_philosophie", label: "Lettres et Philosophie" },
                { value: "langues_vivantes", label: "Langues Vivantes" },
                { value: "informatique_programmation", label: "Informatique et Programmation" },
                { value: "sciences_ingenieur", label: "Sciences de l'Ingénieur" },
                { value: "droit_politique", label: "Droit et Sciences Politiques" },
                { value: "sociologie_psychologie", label: "Sociologie et Psychologie" },
                { value: "arts_plastiques", label: "Arts Plastiques" },
                { value: "education_physique", label: "Éducation Physique et Sportive" },
                { value: "agronomie", label: "Agronomie" },
                { value: "communication", label: "Communication et Médias" }
              ]}
            />

            <div style={{ marginTop: '3rem' }}></div>

            <div className="button-group">
              <Button type="button" variant="secondary" onClick={() => { setOrientationMode(null); setStep(1); }}>Précédent</Button>
              <Button type="submit" variant="primary">Suivant</Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit(onNext)}>
            <h2 style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>Compétences et Objectifs professionnels</h2>
            <br />

            <CustomInputCheckbox register={register} name={"skills"}
              label={'Compétences (sélectionnez toutes celles qui vous décrivent) :'}
              options={[
                ...(enums.SkillsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))),
                { value: "analyse_resolution_problemes", label: "Analyse et résolution de problèmes" },
                { value: "communication_orale_ecrite", label: "Communication orale et écrite" },
                { value: "travail_equipe", label: "Travail en équipe" },
                { value: "leadership", label: "Leadership et gestion" },
                { value: "creativite_innovation", label: "Créativité et innovation" },
                { value: "organisation_planification", label: "Organisation et planification" },
                { value: "technique_manuel", label: "Compétences techniques et manuelles" },
                { value: "informatique_numerique", label: "Compétences informatiques et numériques" },
                { value: "langues_etrangeres", label: "Langues étrangères" },
                { value: "vente_negociation", label: "Vente et négociation" },
                { value: "gestion_projet", label: "Gestion de projet" },
                { value: "recherche_scientifique", label: "Recherche scientifique" },
                { value: "design_creation", label: "Design et création" },
                { value: "enseignement_formation", label: "Enseignement et formation" },
                { value: "soin_sante", label: "Soins et santé" },
                { value: "juridique_reglementaire", label: "Juridique et réglementaire" },
                { value: "logistique_transport", label: "Logistique et transport" },
                { value: "agricole_environnemental", label: "Compétences agricoles et environnementales" },
                { value: "artisanat", label: "Compétences artisanales" },
                { value: "qhse", label: "Qualité, Hygiène, Sécurité, Environnement" }
              ]}
            />
            <CustomInputCheckbox register={register} name={"career_goals"}
              label={'Objectifs professionnels (sélectionnez vos aspirations) :'}
              options={[
                ...(enums.CareerGoalsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))),
                { value: "entreprendre", label: "Créer ma propre entreprise" },
                { value: "carriere_internationale", label: "Travailler à l'international" },
                { value: "recherche_developpement", label: "Faire de la recherche et développement" },
                { value: "encadrement_gestion", label: "Gérer et encadrer des équipes" },
                { value: "travail_independant", label: "Travailler en freelance/indépendant" },
                { value: "service_public", label: "Travailler dans le service public" },
                { value: "ong_humanitaire", label: "Travailler pour une ONG/humanitaire" },
                { value: "enseignement_recherche", label: "Enseigner ou faire de la recherche académique" },
                { value: "innovation_technologique", label: "Innover dans la technologie" },
                { value: "sante_medical", label: "Travailler dans le domaine médical/santé" },
                { value: "droit_justice", label: "Travailler dans le domaine juridique/justice" },
                { value: "environnement_durable", label: "Contribuer à l'environnement durable" },
                { value: "arts_culture", label: "Travailler dans les arts et la culture" },
                { value: "industrie_manufacture", label: "Travailler dans l'industrie/manufacture" },
                { value: "tourisme_hotellerie", label: "Travailler dans le tourisme/hôtellerie" },
                { value: "logistique_transport", label: "Travailler dans la logistique/transport" },
                { value: "artisanat_tradition", label: "Pratiquer un artisanat traditionnel" }
              ]}
            />
            <div className="button-group">
              <Button type="button" variant="secondary" onClick={handlePrevious}>Précédent</Button>
              <Button type="submit" variant="primary">Suivant</Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleSubmit(onNext)}>
            <h3>Langues & Contraintes</h3>
            <CustomInputRadio register={register} name={"like_external_langage"}
              label={"Aimes-tu apprendre d'autres langues ?"}
              options={[
                { value: "true", label: "Oui" },
                { value: "false", label: "Non" }
              ]}
            />

            {likeLang === "true" && (
              <CustomInputCheckbox register={register} name={"external_langages"}
                label={'Langues (sélectionnez celles que vous parlez ou souhaitez apprendre) :'}
                options={[
                  ...(enums.LangEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))),
                  { value: "anglais", label: "Anglais" },
                  { value: "francais", label: "Français" },
                  { value: "espagnol", label: "Espagnol" },
                  { value: "allemand", label: "Allemand" },
                  { value: "portugais", label: "Portugais" },
                  { value: "chinois", label: "Chinois" },
                  { value: "arabe", label: "Arabe" },
                  { value: "italien", label: "Italien" },
                  { value: "russe", label: "Russe" },
                  { value: "japonais", label: "Japonais" }
                ]}
              />
            )}

            <p style={{ marginBottom: '12px' }}>Contraintes personnelles (sélectionnez toutes celles qui s'appliquent) :</p>
            <select {...register("constraints")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              {enums.ConstraintsEnum.map((constraint, idx) => (
                <option key={idx} value={constraint}>{formatEnumLabel(constraint)}</option>
              ))}
              <option value="aucune">Aucune contrainte particulière</option>
              <option value="mobilite_reduite">Mobilité réduite</option>
              <option value="budget_limite">Budget limité pour les études</option>
              <option value="distance_famille">Besoin de rester proche de la famille</option>
              <option value="sante_specifique">Problèmes de santé spécifiques</option>
              <option value="temps_partiel">Besoin de travailler à temps partiel</option>
              <option value="enfants">Enfants à charge</option>
              <option value="handicap">Handicap</option>
            </select>
              
            <p style={{ marginBottom: '12px' }}>Quel est votre type de personnalité ?</p>
            <select {...register("personality_profile")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              {enums.PersonalityProfileEnum.map((item, idx) => (
                <option key={idx} value={item}>{formatEnumLabel(item)}</option>
              ))}
              <option value="analytique">Analytique et logique</option>
              <option value="creatifs">Créatif et imaginatif</option>
              <option value="social">Social et empathique</option>
              <option value="leader">Leader et charismatique</option>
              <option value="organise">Organisé et méthodique</option>
              <option value="aventurier">Aventurier et curieux</option>
              <option value="pragmatique">Pragmatique et réaliste</option>
              <option value="introverti">Introverti et réfléchi</option>
              <option value="extroverti">Extraverti et communicatif</option>
            </select>

            <div className="button-group">
              <Button type="button" variant="secondary" onClick={handlePrevious}>Précédent</Button>
              <Button type="submit" variant="primary">Suivant</Button>
            </div>
          </form>
        )}

        {step === 5 && (
          <form onSubmit={handleSubmit(onNext)}>
            <h3>Style de travail & Préférences</h3>
            
            <p>Quel est ton style de travail préféré ?</p>
            <select {...register("work_style")} required>
              <option value="">Sélectionne une option</option>
              <option value="autonome">Travail autonome et indépendant</option>
              <option value="equipe">Travail en équipe collaboratif</option>
              <option value="mixte">Mixte (autonome et équipe)</option>
              <option value="encadre">Travail encadré avec supervision</option>
              <option value="creative">Travail créatif et innovant</option>
              <option value="methodique">Travail méthodique et structuré</option>
              <option value="dynamique">Travail dynamique et rapide</option>
              <option value="analytique">Travail analytique et approfondi</option>
            </select>

            <p>Quel environnement de travail te convient le mieux ?</p>
            <select {...register("work_environment")} required>
              <option value="">Sélectionne une option</option>
              <option value="bureau">En bureau / espace de travail</option>
              <option value="exterieur">En extérieur / terrain</option>
              <option value="distance">Télétravail / distance</option>
              <option value="variable">Environnement variable</option>
              <option value="laboratoire">Laboratoire / salle technique</option>
              <option value="atelier">Atelier / espace de production</option>
              <option value="salle_classe">Salle de classe / éducation</option>
              <option value="hopital">Hôpital / établissement de santé</option>
              <option value="tribunal">Tribunal / environnement juridique</option>
              <option value="terrain_agricole">Terrain agricole / environnement naturel</option>
            </select>

            <p>Quel niveau de responsabilité recherches-tu ?</p>
            <select {...register("responsibility_level")} required>
              <option value="">Sélectionne une option</option>
              <option value="execution">Rôle d'exécution / tâches définies</option>
              <option value="gestion">Rôle de gestion / coordination</option>
              <option value="decision">Rôle de décision / stratégie</option>
              <option value="leadership">Rôle de leadership / direction</option>
              <option value="expertise">Rôle d'expertise technique</option>
              <option value="conseil">Rôle de conseil et accompagnement</option>
              <option value="innovation">Rôle d'innovation et R&D</option>
            </select>

            <p>Quel est ton style d'apprentissage ?</p>
            <select {...register("learning_style")} required>
              <option value="">Sélectionne une option</option>
              <option value="theorique">Théorique / académique</option>
              <option value="pratique">Pratique / terrain</option>
              <option value="visuel">Visuel / démonstrations</option>
              <option value="mixte">Mixte (théorie et pratique)</option>
              <option value="auditif">Auditif / écoute et discussion</option>
              <option value="experientiel">Expérientiel / apprentissage par l'expérience</option>
              <option value="collaboratif">Collaboratif / apprentissage en groupe</option>
            </select>

            <div style={{ marginTop: '3rem' }}></div>

            <div className="button-group">
              <Button type="button" variant="secondary" onClick={handlePrevious}>Précédent</Button>
              <Button type="submit" variant="primary">Suivant</Button>
            </div>
          </form>
        )}

        {step === 6 && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <h3>Intérêts spécifiques par secteur</h3>
            <p style={{ marginBottom: '12px' }}>Ces questions nous aident à affiner vos recommandations selon vos affinités avec différents domaines.</p>

            <p style={{ marginBottom: '12px' }}>Quel est votre niveau d'intérêt pour les questions sociales et l'aide aux autres ?</p>
            <select {...register("social_engagement")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              <option value="very_high">Très élevé - Je veux travailler directement avec les gens</option>
              <option value="high">Élevé - J'aime aider et comprendre les problèmes sociaux</option>
              <option value="medium">Moyen - Intéressé mais pas prioritaire</option>
              <option value="low">Faible - Je préfère d'autres domaines</option>
            </select>

            <p style={{ marginBottom: '12px' }}>Aimez-vous la recherche, l'analyse et la résolution de problèmes complexes ?</p>
            <select {...register("research_interest")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              <option value="very_high">Très élevé - J'adore analyser et trouver des solutions</option>
              <option value="high">Élevé - J'aime comprendre comment les choses fonctionnent</option>
              <option value="medium">Moyen - Quand nécessaire</option>
              <option value="low">Faible - Je préfère l'action concrète</option>
            </select>

            <p style={{ marginBottom: '12px' }}>Quel est votre intérêt pour les domaines créatifs et artistiques ?</p>
            <select {...register("creative_interest")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              <option value="very_high">Très élevé - Je veux créer et innover</option>
              <option value="high">Élevé - J'aime l'expression artistique</option>
              <option value="medium">Moyen - Un peu intéressé</option>
              <option value="low">Faible - Pas mon domaine</option>
            </select>

            <p style={{ marginBottom: '12px' }}>Quel est votre intérêt pour le domaine de la santé et du bien-être ?</p>
            <select {...register("health_interest")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              <option value="very_high">Très élevé - Je veux soigner et accompagner</option>
              <option value="high">Élevé - Intéressé par la médecine/biologie</option>
              <option value="medium">Moyen - Curieux mais pas prioritaire</option>
              <option value="low">Faible - Pas pour moi</option>
            </select>

            <p style={{ marginBottom: '12px' }}>Quel est votre intérêt pour le droit, la justice et les règles ?</p>
            <select {...register("legal_interest")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              <option value="very_high">Très élevé - Je veux défendre les droits et la justice</option>
              <option value="high">Élevé - J'aime comprendre les lois et régulations</option>
              <option value="medium">Moyen - Un peu intéressé</option>
              <option value="low">Faible - Pas mon domaine</option>
            </select>

            <p style={{ marginBottom: '12px' }}>Quel est votre intérêt pour l'agriculture, l'environnement et le développement durable ?</p>
            <select {...register("agricultural_interest")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              <option value="very_high">Très élevé - Je veux travailler dans ce secteur</option>
              <option value="high">Élevé - Passionné par l'environnement</option>
              <option value="medium">Moyen - Conscient de l'importance</option>
              <option value="low">Faible - Pas prioritaire</option>
            </select>

            <p style={{ marginBottom: '12px' }}>Quel est votre intérêt pour le monde des affaires, l'entrepreneuriat et la gestion ?</p>
            <select {...register("business_interest")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              <option value="very_high">Très élevé - Je veux créer ou gérer une entreprise</option>
              <option value="high">Élevé - Intéressé par l'économie et la finance</option>
              <option value="medium">Moyen - Ouvert aux opportunités</option>
              <option value="low">Faible - Je préfère d'autres secteurs</option>
            </select>

            <div style={{ marginTop: '3rem' }}></div>

            <div className="button-group">
              <Button type="button" variant="secondary" onClick={handlePrevious}>Précédent</Button>
              <Button type="submit" variant="primary">Valider</Button>
            </div>
          </form>
        )}
      </div>

      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}

export default OrientationForm;