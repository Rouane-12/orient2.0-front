import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { toast } from 'sonner';
import PaymentModal from '../../components/PaymentModal';
import { CustomInputCheckbox, CustomInputRadio } from '../../uikits/form/choices';
import { CustomInputFile } from '../../uikits/form/file';
import { ChevronRight, ChevronLeft, Check, Loader2, FileText, Target, Heart, Briefcase, Languages, Settings } from 'lucide-react';
import './DashboardSteps.scss';

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

const DashboardSteps = () => {
  const [orientationMode, setOrientationMode] = useState(null); // 'bulletins' or 'preferences'
  const TOTAL_STEPS = orientationMode === 'preferences' ? 6 : 7;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [enums, setEnums] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [canHaveFreeOrientation, setCanHaveFreeOrientation] = useState(false);
  const filesRef = useRef({});
  const fileCache = useRef({});

  const formatEnumLabel = (value) => {
    return value.replace(/_/g, ' ');
  };

  const { user, token } = useAuth();
  const navigate = useNavigate();

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
    },
  });

  const selected = watch("upload_choice");
  const schoolType = watch("school_type");
  const likeLang = watch("like_external_langage");

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
    setHasPaid(false);
    setCanHaveFreeOrientation(false);
  }, [token]);

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  const extractAndSaveFiles = (data) => {
    FILE_FIELDS.forEach(field => {
      const fieldData = data[field];
      if (fieldData) {
        const filesArray = Array.isArray(fieldData) ? fieldData : Array.from(fieldData);
        if (filesArray.length > 0 && filesArray[0] instanceof File) {
          const file = filesArray[0];
          const cachedFile = new File([file], file.name, { type: file.type });
          filesRef.current[field] = cachedFile;
          fileCache.current[field] = cachedFile;
        }
      } else if (fileCache.current[field]) {
        filesRef.current[field] = fileCache.current[field];
      }
      delete data[field];
    });
  };

  const onNext = async (data) => {
    extractAndSaveFiles(data);
    const updatedData = { ...formData, ...data };

    // Validation stricte pour chaque step
    if (step === 2 && orientationMode === 'bulletins') {
      // Step 2 (bulletins): Vérifier que les fichiers sont uploadés
      const uploadChoice = updatedData.upload_choice;
      const schoolType = updatedData.school_type;

      // Vérifier que le type d'université est sélectionné
      if (!schoolType) {
        toast.error("Veuillez sélectionner le type d'université (public, privé ou peu importe) pour continuer.");
        return;
      }

      // Vérifier que le choix de bulletins est sélectionné
      if (!uploadChoice) {
        toast.error("Veuillez sélectionner quels bulletins vous souhaitez renseigner (Seconde à Terminale, Première à Terminale, ou Terminale uniquement) pour continuer.");
        return;
      }

      let requiredFiles = [];

      if (uploadChoice && config[uploadChoice]) {
        const typeConfig = config[uploadChoice][schoolType === 'both' ? 'private' : schoolType] || config[uploadChoice]['private'];
        typeConfig.forEach(section => {
          requiredFiles.push(...section.fields);
        });
      }
      requiredFiles.push("final_exam_data");

      const missingFiles = requiredFiles.filter(field => !filesRef.current[field]);
      if (missingFiles.length > 0) {
        toast.error("Veuillez télécharger tous les bulletins scolaires requis. Une analyse complète nécessite vos bulletins et votre relevé du Bac.");
        return;
      }
    }

    if (step === 2 && orientationMode === 'preferences') {
      // Step 2 (preferences): Vérifier centre d'intérêt et matières préférées
      if (!updatedData.interest_center) {
        toast.error("Veuillez sélectionner un centre d'intérêt pour continuer.");
        return;
      }
      if (!updatedData.school_favorite_subject || updatedData.school_favorite_subject.length === 0) {
        toast.error("Veuillez sélectionner au moins une matière préférée pour continuer.");
        return;
      }
    }

    if (step === 3 && orientationMode === 'bulletins') {
      // Step 3 (bulletins): Vérifier centre d'intérêt et matières préférées
      if (!updatedData.interest_center) {
        toast.error("Veuillez sélectionner un centre d'intérêt pour continuer.");
        return;
      }
      if (!updatedData.school_favorite_subject || updatedData.school_favorite_subject.length === 0) {
        toast.error("Veuillez sélectionner au moins une matière préférée pour continuer.");
        return;
      }
    }

    if (step === 3 && orientationMode === 'preferences') {
      // Step 3 (preferences): Vérifier compétences et objectifs professionnels
      if (!updatedData.skills || updatedData.skills.length === 0) {
        toast.error("Veuillez sélectionner au moins une compétence pour continuer.");
        return;
      }
      if (!updatedData.career_goals || updatedData.career_goals.length === 0) {
        toast.error("Veuillez sélectionner au moins un objectif professionnel pour continuer.");
        return;
      }
    }

    if (step === 4 && orientationMode === 'bulletins') {
      // Step 4 (bulletins): Vérifier compétences et objectifs professionnels
      if (!updatedData.skills || updatedData.skills.length === 0) {
        toast.error("Veuillez sélectionner au moins une compétence pour continuer.");
        return;
      }
      if (!updatedData.career_goals || updatedData.career_goals.length === 0) {
        toast.error("Veuillez sélectionner au moins un objectif professionnel pour continuer.");
        return;
      }
    }

    if (step === 4 && orientationMode === 'preferences') {
      // Step 4 (preferences): Vérifier contraintes et personnalité
      if (!updatedData.constraints) {
        toast.error("Veuillez sélectionner vos contraintes personnelles pour continuer.");
        return;
      }
      if (!updatedData.personality_profile) {
        toast.error("Veuillez sélectionner votre type de personnalité pour continuer.");
        return;
      }
    }

    if (step === 5 && orientationMode === 'bulletins') {
      // Step 5 (bulletins): Vérifier contraintes et personnalité
      if (!updatedData.constraints) {
        toast.error("Veuillez sélectionner vos contraintes personnelles pour continuer.");
        return;
      }
      if (!updatedData.personality_profile) {
        toast.error("Veuillez sélectionner votre type de personnalité pour continuer.");
        return;
      }
    }

    if (step === 5 && orientationMode === 'preferences') {
      // Step 5 (preferences): Vérifier style de travail
      if (!updatedData.work_style) {
        toast.error("Veuillez sélectionner votre style de travail pour continuer.");
        return;
      }
      if (!updatedData.work_environment) {
        toast.error("Veuillez sélectionner votre environnement de travail pour continuer.");
        return;
      }
      if (!updatedData.responsibility_level) {
        toast.error("Veuillez sélectionner votre niveau de responsabilité pour continuer.");
        return;
      }
      if (!updatedData.learning_style) {
        toast.error("Veuillez sélectionner votre style d'apprentissage pour continuer.");
        return;
      }
    }

    if (step === 6 && orientationMode === 'bulletins') {
      // Step 6 (bulletins): Vérifier style de travail
      if (!updatedData.work_style) {
        toast.error("Veuillez sélectionner votre style de travail pour continuer.");
        return;
      }
      if (!updatedData.work_environment) {
        toast.error("Veuillez sélectionner votre environnement de travail pour continuer.");
        return;
      }
      if (!updatedData.responsibility_level) {
        toast.error("Veuillez sélectionner votre niveau de responsabilité pour continuer.");
        return;
      }
      if (!updatedData.learning_style) {
        toast.error("Veuillez sélectionner votre style d'apprentissage pour continuer.");
        return;
      }
    }

    setFormData(updatedData);
    setStep(prev => prev + 1);
  };

  const onSubmit = async (data) => {
    if (!hasPaid) {
      setShowPaymentModal(true);
      return;
    }

    extractAndSaveFiles(data);
    const finalData = { ...formData, ...data };

    // Check if we're in preferences mode (no files needed)
    const isPreferencesMode = orientationMode === 'preferences';

    // Only check for files if not in preferences mode
    if (!isPreferencesMode) {
      const uploadChoice = finalData.upload_choice;
      const schoolType = finalData.school_type;
      let requiredFiles = [];

      if (uploadChoice && config[uploadChoice]) {
        const typeConfig = config[uploadChoice][schoolType === 'both' ? 'private' : schoolType] || config[uploadChoice]['private'];
        typeConfig.forEach(section => {
          requiredFiles.push(...section.fields);
        });
      }

      // Always add final exam data
      requiredFiles.push("final_exam_data");

      const missingFiles = requiredFiles.filter(field => !filesRef.current[field]);

      if (missingFiles.length > 0) {
        toast.error(`Fichiers manquants : ${missingFiles.join(', ')}`);
        return;
      }
    }

    setIsSubmitting(true);

    const payload = {
      userId: user.id,
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
      learning_style: finalData.learning_style
    };

    // Use different endpoint based on mode
    const endpoint = isPreferencesMode 
      ? `${API_BASE_URL}api/orientation/preferences-only`
      : `${API_BASE_URL}api/orientation`;

    let requestPayload;
    let requestConfig = {
      headers: { Authorization: `Bearer ${token}` }
    };

    if (isPreferencesMode) {
      // For preferences mode, send JSON without files
      requestConfig.headers['Content-Type'] = 'application/json';
      requestPayload = payload;
    } else {
      // For bulletins mode, send FormData with files
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

      requestPayload = payloadFormData;
    }

    try {
      const orientReq = await axios.post(endpoint, requestPayload, requestConfig);
      
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
    const currentValues = getValues();
    const finalData = { ...formData, ...currentValues };
    onSubmit(finalData);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const steps = orientationMode === 'preferences' ? [
    { id: 1, title: 'Mode d\'orientation', description: 'Choisissez votre mode' },
    { id: 2, title: 'Centre d\'intérêt', description: 'Vos préférences' },
    { id: 3, title: 'Compétences', description: 'Vos objectifs professionnels' },
    { id: 4, title: 'Langues & Contraintes', description: 'Vos préférences' },
    { id: 5, title: 'Style de travail', description: 'Récapitulatif' },
    { id: 6, title: 'Confirmation', description: 'Finalisation' }
  ] : [
    { id: 1, title: 'Mode d\'orientation', description: 'Choisissez votre mode' },
    { id: 2, title: 'Documents scolaires', description: 'Bulletins et relevés' },
    { id: 3, title: 'Centre d\'intérêt', description: 'Vos préférences' },
    { id: 4, title: 'Compétences', description: 'Vos objectifs professionnels' },
    { id: 5, title: 'Langues & Contraintes', description: 'Vos préférences' },
    { id: 6, title: 'Style de travail', description: 'Récapitulatif' },
    { id: 7, title: 'Confirmation', description: 'Finalisation' }
  ];

  if (!enums) return <div className="dashboard__loading">Chargement des données...</div>;
  if (isSubmitting) return <div className="dashboard__loading">Envoi du formulaire en cours...</div>;

  return (
    <div className="dashboard-steps">
      <div className="dashboard-steps__header">
        <h1>Nouvelle orientation</h1>
        <p>Étape {step} sur {TOTAL_STEPS} - {steps[step - 1]?.description || 'Finalisation'}</p>
      </div>

      <div className="dashboard-steps__progress">
        {steps.map((stepItem, index) => (
          <div 
            key={stepItem.id} 
            className={`step-indicator ${step === stepItem.id ? 'step-indicator--active' : ''} ${step > stepItem.id ? 'step-indicator--completed' : ''}`}
          >
            <div className="step-indicator__number">
              {step > stepItem.id ? <Check size={16} /> : stepItem.id}
            </div>
            <div className="step-indicator__info">
              <span className="step-indicator__title">{stepItem.title}</span>
              <span className="step-indicator__description">{stepItem.description}</span>
            </div>
            {index < steps.length - 1 && <div className="step-indicator__line" />}
          </div>
        ))}
      </div>

      <div className="dashboard-steps__content">
        {step === 1 && (
          <form onSubmit={(e) => {
            e.preventDefault();
            if (orientationMode) {
              setStep(2);
            }
          }}>
            <div className="step-content">
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
                  <div style={{ marginBottom: '10px', color: '#e67028' }}><FileText size={48} /></div>
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
                  <div style={{ marginBottom: '10px', color: '#e67028' }}><Target size={48} /></div>
                  <h4 style={{ marginBottom: '10px', color: '#151515' }}>Mode Préférences</h4>
                  <p style={{ fontSize: '0.9rem', color: '#626262', lineHeight: '1.5' }}>
                    Orientation basée uniquement sur un questionnaire détaillé de vos préférences et intérêts. Idéal si vous n'avez pas vos bulletins sous la main.
                  </p>
                </div>
              </div>
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={handlePrevious} disabled>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary" disabled={!orientationMode}>
                Suivant
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        )}

        {step === 2 && orientationMode === 'bulletins' && (
          <form onSubmit={handleSubmit(onNext)}>
            <div className="step-content">
              <h3>Préférence et Documents scolaires</h3>

              <div className="form-group">
                <label>Quel type d'université souhaitez-vous fréquenter ?</label>
                <select {...register("school_type")} required>
                  <option value="">Sélectionne une option</option>
                  <option value="public">Public</option>
                  <option value="private">Privé</option>
                  <option value="both">Peu importe</option>
                </select>
              </div>

              <CustomInputRadio register={register} name={"upload_choice"}
                label={'Souhaitez-vous renseigner :'}
                options={[
                  { value: "seconde", label: "Vos Bulletins de Seconde à Terminale" },
                  { value: "premiere", label: "Vos Bulletins de Première à Terminale" },
                  { value: "terminale", label: "Vos Bulletin de Terminale uniquement" },
                ]}
              />

              {selected && schoolType && config[selected] && (() => {
                const typeToUse = schoolType === 'both' ? 'private' : schoolType;
                const sections = config[selected][typeToUse];
                return sections?.map((section, index) => (
                  <div key={'section' + index} className="form-section">
                    <p>{section.label} :</p>
                    {section.fields.map((field, idx) => (
                      <CustomInputFile key={'input file' + idx + field} register={register} name={field}
                        label={`Bulletin ${idx + 1}`}
                        watch={watch} resetField={resetField} require={{ required: 'Ce champ est requis' }} />
                    ))}
                  </div>
                ));
              })()}

              <CustomInputFile register={register} name={"final_exam_data"} label={"Relevé du Bac :"}
                watch={watch} resetField={resetField} require={{ required: 'Ce champ est requis' }} />
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={() => { setOrientationMode(null); setStep(1); }}>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary">
                Suivant
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        )}


        {step === 2 && orientationMode === 'preferences' && (
          <form onSubmit={handleSubmit(onNext)}>
            <div className="step-content">
              <h3>Centre d'intérêt</h3>

              <div className="form-group">
                <label>Quel est votre centre d'intérêt principal ?</label>
                <select {...register("interest_center")} required>
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
              </div>

              <CustomInputCheckbox register={register} name={"school_favorite_subject"}
                label={'Matières préférées :'}
                options={enums.FavoriteSubjectsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
              />
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={() => { setOrientationMode(null); setStep(1); }}>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary">
                Suivant
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        )}

        {step === 3 && orientationMode === 'bulletins' && (
          <form onSubmit={handleSubmit(onNext)}>
            <div className="step-content">
              <h3>Centre d'intérêt</h3>

              <div className="form-group">
                <label>Quel est votre centre d'intérêt ?</label>
                <select {...register("interest_center")} required>
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
              </div>

              <CustomInputCheckbox register={register} name={"school_favorite_subject"}
                label={'Matières préférées :'}
                options={enums.FavoriteSubjectsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
              />
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary">
                Suivant
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        )}

        {step === 3 && orientationMode === 'preferences' && (
          <form onSubmit={handleSubmit(onNext)}>
            <div className="step-content">
              <h3>Compétences et Objectifs professionnels</h3>
             <br />
              

              <CustomInputCheckbox register={register} name={"skills"}
                label={'Compétences :'}
                options={enums.SkillsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
              />
              <CustomInputCheckbox register={register} name={"career_goals"}
                label={'Objectifs professionnels :'}
                options={enums.CareerGoalsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
              />
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary">
                Suivant
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        )}

        {step === 4 && orientationMode === 'preferences' && (
          <form onSubmit={handleSubmit(onNext)}>
            <div className="step-content">
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
                  label={'Langues :'}
                  options={enums.LangEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
                />
              )}

              <div className="form-group">
                <label>Contraintes personnelles :</label>
                <select {...register("constraints")} required>
                  <option value="">Sélectionne une option</option>
                  {enums.ConstraintsEnum.map((constraint, idx) => (
                    <option key={idx} value={constraint}>{formatEnumLabel(constraint)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quel est votre type de personnalité ?</label>
                <select {...register("personality_profile")} required>
                  <option value="">Sélectionne une option</option>
                  {enums.PersonalityProfileEnum.map((item, idx) => (
                    <option key={idx} value={item}>{formatEnumLabel(item)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary">
                Suivant
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        )}

        {step === 4 && orientationMode === 'bulletins' && (
          <form onSubmit={handleSubmit(onNext)}>
            <div className="step-content">
              <h3>Compétences et Objectifs professionnels</h3>
              <br />

              <CustomInputCheckbox register={register} name={"skills"}
                label={'Compétences :'}
                options={enums.SkillsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
              />
              <CustomInputCheckbox register={register} name={"career_goals"}
                label={'Objectifs professionnels :'}
                options={enums.CareerGoalsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
              />
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary">
                Suivant
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        )}


        {step === 5 && orientationMode === 'bulletins' && (
          <form onSubmit={handleSubmit(onNext)}>
            <div className="step-content">
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
                  label={'Langues :'}
                  options={enums.LangEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
                />
              )}

              <div className="form-group">
                <label>Contraintes personnelles :</label>
                <select {...register("constraints")} required>
                  <option value="">Sélectionne une option</option>
                  {enums.ConstraintsEnum.map((constraint, idx) => (
                    <option key={idx} value={constraint}>{formatEnumLabel(constraint)}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quel est votre type de personnalité ?</label>
                <select {...register("personality_profile")} required>
                  <option value="">Sélectionne une option</option>
                  {enums.PersonalityProfileEnum.map((item, idx) => (
                    <option key={idx} value={item}>{formatEnumLabel(item)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary">
                Suivant
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        )}


        {step === 5 && orientationMode === 'preferences' && (
          <form onSubmit={handleSubmit(onNext)}>
            <div className="step-content">
              <h3>Style de travail & Préférences</h3>

              <div className="form-group">
                <label>Quel est ton style de travail préféré ?</label>
                <select {...register("work_style")} required>
                  <option value="">Sélectionne une option</option>
                  <option value="autonome">Travail autonome et indépendant</option>
                  <option value="equipe">Travail en équipe collaboratif</option>
                  <option value="mixte">Mixte (autonome et équipe)</option>
                  <option value="encadre">Travail encadré avec supervision</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quel environnement de travail te convient le mieux ?</label>
                <select {...register("work_environment")} required>
                  <option value="">Sélectionne une option</option>
                  <option value="bureau">En bureau / espace de travail</option>
                  <option value="exterieur">En extérieur / terrain</option>
                  <option value="distance">Télétravail / distance</option>
                  <option value="variable">Environnement variable</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quel niveau de responsabilité recherches-tu ?</label>
                <select {...register("responsibility_level")} required>
                  <option value="">Sélectionne une option</option>
                  <option value="execution">Rôle d'exécution / tâches définies</option>
                  <option value="gestion">Rôle de gestion / coordination</option>
                  <option value="decision">Rôle de décision / stratégie</option>
                  <option value="leadership">Rôle de leadership / direction</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quel est ton style d'apprentissage ?</label>
                <select {...register("learning_style")} required>
                  <option value="">Sélectionne une option</option>
                  <option value="theorique">Théorique / académique</option>
                  <option value="pratique">Pratique / terrain</option>
                  <option value="visuel">Visuel / démonstrations</option>
                  <option value="mixte">Mixte (théorie et pratique)</option>
                </select>
              </div>
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary">
                Suivant
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        )}

        {step === 6 && orientationMode === 'preferences' && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="step-content">
              <h3>Confirmation</h3>
              <p>Vous êtes sur le point de soumettre votre orientation.</p>
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Valider'}
              </button>
            </div>
          </form>
        )}

        {step === 6 && orientationMode === 'bulletins' && (
          <form onSubmit={handleSubmit(onNext)}>
            <div className="step-content">
              <h3>Style de travail & Préférences</h3>

              <div className="form-group">
                <label>Quel est ton style de travail préféré ?</label>
                <select {...register("work_style")} required>
                  <option value="">Sélectionne une option</option>
                  <option value="autonome">Travail autonome et indépendant</option>
                  <option value="equipe">Travail en équipe collaboratif</option>
                  <option value="mixte">Mixte (autonome et équipe)</option>
                  <option value="encadre">Travail encadré avec supervision</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quel environnement de travail te convient le mieux ?</label>
                <select {...register("work_environment")} required>
                  <option value="">Sélectionne une option</option>
                  <option value="bureau">En bureau / espace de travail</option>
                  <option value="exterieur">En extérieur / terrain</option>
                  <option value="distance">Télétravail / distance</option>
                  <option value="variable">Environnement variable</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quel niveau de responsabilité recherches-tu ?</label>
                <select {...register("responsibility_level")} required>
                  <option value="">Sélectionne une option</option>
                  <option value="execution">Rôle d'exécution / tâches définies</option>
                  <option value="gestion">Rôle de gestion / coordination</option>
                  <option value="decision">Rôle de décision / stratégie</option>
                  <option value="leadership">Rôle de leadership / direction</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quel est ton style d'apprentissage ?</label>
                <select {...register("learning_style")} required>
                  <option value="">Sélectionne une option</option>
                  <option value="theorique">Théorique / académique</option>
                  <option value="pratique">Pratique / terrain</option>
                  <option value="visuel">Visuel / démonstrations</option>
                  <option value="mixte">Mixte (théorie et pratique)</option>
                </select>
              </div>
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary">
                Suivant
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        )}

        {step === 7 && orientationMode === 'bulletins' && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="step-content">
              <h3>Confirmation</h3>
              <p>Vous êtes sur le point de soumettre votre orientation.</p>
            </div>
            <div className="dashboard-steps__footer">
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                <ChevronLeft size={20} />
                Précédent
              </button>
              <button type="submit" className="btn-primary" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Valider'}
              </button>
            </div>
          </form>
        )}
      </div>

      {showPaymentModal && (
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};

export default DashboardSteps;
