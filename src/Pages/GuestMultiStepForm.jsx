import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import '../style/MultiStepForm.scss';
import ProgressBar from '../component/ProgressBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CustomInputCheckbox, CustomInputRadio } from '../uikits/form/choices';
import { CustomInputFile } from '../uikits/form/file';
import { SvgSpinners6DotsRotate } from '../uikits/Icons';
import API_BASE_URL from '../config/api';
import { toast } from 'sonner';
import { getFingerprint } from '../utils/fingerprint';

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

function GuestOrientationForm() {
  const TOTAL_STEPS = 6;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [enums, setEnums] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filesRef = useRef({});
  const [deviceId] = useState(() => {
    let id = localStorage.getItem('guest_device_id');
    if (!id) {
      id = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('guest_device_id', id);
    }
    return id;
  });

  // Fonction pour formater les labels (remplacer les underscores par des espaces)
  const formatEnumLabel = (value) => {
    return value.replace(/_/g, ' ');
  };

  const { register, handleSubmit, reset, resetField, watch, getValues } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      upload_choice: '',
      interest_center: '',
      school_type: "",
      school_favorite_subject: [],
      skills: [],
      career_goals: [],
      personality_profile: "",
      like_external_langage: "",
      external_langages: [],
      constraints: ""
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
    reset(formData);
  }, [formData, reset]);

  // Cache for files to prevent ERR_UPLOAD_FILE_CHANGED
  const fileCache = useRef({});

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
    setFormData(updatedData);
    localStorage.setItem('guestOrientationFormData', JSON.stringify(updatedData));
    setStep(prev => prev + 1);
  };

  const onSubmit = async (data) => {
    extractAndSaveFiles(data);

    const finalData = { ...formData, ...data };

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

    // Get device fingerprint
    let fingerprint = '';
    try {
      fingerprint = await getFingerprint();
    } catch (error) {
      console.error('Error getting fingerprint:', error);
    }

    const payload = {
      deviceId: deviceId,
      first_name: finalData.first_name,
      last_name: finalData.last_name,
      email: finalData.email,
      interest_center: finalData.interest_center,
      school_type: finalData.school_type,
      school_favorite_subject: finalData.school_favorite_subject || [],
      skills: finalData.skills || [],
      career_goals: finalData.career_goals || [],
      personality_profile: finalData.personality_profile,
      like_external_langage: finalData.like_external_langage === 'true',
      external_langages: finalData.like_external_langage === 'true' ? finalData.external_langages || [] : [],
      constraints: finalData.constraints
    };

    const payloadFormData = new FormData();

    // Ajouter deviceId en premier
    payloadFormData.append('deviceId', deviceId);

    for (const key in payload) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) {
        if (key === 'deviceId') continue; // Déjà ajouté
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
      const orientReq = await axios.post(`${API_BASE_URL}api/guest-orientation`, payloadFormData, {
        headers: {
          'X-Device-Fingerprint': fingerprint
        }
      });
      
      if (orientReq.data.success === false) {
        toast.error(orientReq.data.error || 'Erreur lors de la soumission');
        if (orientReq.data.alreadyUsed) {
          // Si déjà utilisé, rediriger vers login
          setTimeout(() => navigate('/login'), 2000);
        }
        return;
      }
      
      // Stocker l'ID d'orientation gratuite dans localStorage
      localStorage.setItem('guest_orientation_id', orientReq.data.guestId);
      
      toast.success('Formulaire soumis avec succès !');
      navigate('/guest-result/' + orientReq.data.guestId);
    } catch (err) {
      console.error("Erreur lors de l'envoi du formulaire :", err);

      let errorMessage = "Une erreur est survenue lors de la soumission.";

      if (err.code === 'ERR_NETWORK') {
        errorMessage = "Erreur de connexion au serveur. Vérifiez votre connexion internet.";
      } else if (err.message.includes('ERR_UPLOAD_FILE_CHANGED')) {
        errorMessage = "Erreur avec un fichier : Réessayez de sélectionner les fichiers avant de soumettre !";
      } else if (err.response) {
        const backendError = err.response.data?.error;
        if (backendError === 'Les 20 orientations gratuites ont été utilisées') {
          errorMessage = "Les 20 orientations gratuites ont été utilisées. Veuillez vous connecter pour continuer.";
        } else if (backendError === 'Fichiers manquants') {
          errorMessage = "Fichiers manquants. Les bulletins finaux et le relevé de BAC sont requis.";
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
          <form onSubmit={handleSubmit(onNext)}>
            <h3>Informations personnelles</h3>
            <p style={{ marginBottom: '12px' }}>Commençons par vous connaître</p>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#151515' }}>Prénom *</label>
              <input
                {...register("first_name", { required: 'Ce champ est requis' })}
                type="text"
                placeholder="Votre prénom"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.15)', background: '#ffffff', color: '#151515', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#151515' }}>Nom *</label>
              <input
                {...register("last_name", { required: 'Ce champ est requis' })}
                type="text"
                placeholder="Votre nom"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.15)', background: '#ffffff', color: '#151515', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#151515' }}>Email *</label>
              <input
                {...register("email", { required: 'Ce champ est requis', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email invalide' } })}
                type="email"
                placeholder="votre@email.com"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(0, 0, 0, 0.15)', background: '#ffffff', color: '#151515', fontSize: '0.95rem' }}
              />
            </div>

            <div className="button-group">
              <button type="button" onClick={handlePrevious} disabled>Précédent</button>
              <button type="submit">Suivant</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onNext)}>
            <h3>Préférences et Documents scolaires</h3>
            <p style={{ marginBottom: '12px' }}>Quel type d'université souhaitez-vous fréquenter ?</p>
            <select {...register("school_type")} required style={{ marginBottom: '16px' }}>
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

            {selected && schoolType && config[selected] && (() => {
              const typeToUse = schoolType === 'both' ? 'private' : schoolType;
              const sections = config[selected][typeToUse];
              console.log('Debug - selected:', selected, 'schoolType:', schoolType, 'typeToUse:', typeToUse, 'sections:', sections);
              return sections?.map((section, index) => (
                <div key={'section' + index}>
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

            <div className="button-group">
              <button type="button" onClick={handlePrevious}>Précédent</button>
              <button type="submit">Suivant</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit(onNext)}>
            <h3>Centre d'intérêt</h3>
            <p style={{ marginBottom: '12px' }}>Quel est votre centre d'intérêt principal ?</p>
            <select {...register("interest_center")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              {enums.InterestCenterEnum.map((item, idx) => (
                <option key={idx} value={item}>{formatEnumLabel(item)}</option>
              ))}
            </select>

            <CustomInputCheckbox register={register} name={"school_favorite_subject"}
              label={'Matières préférées (sélectionnez toutes celles qui vous intéressent) :'}
              options={enums.FavoriteSubjectsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
            />

            <div className="button-group">
              <button type="button" onClick={handlePrevious}>Précédent</button>
              <button type="submit">Suivant</button>
            </div>
          </form>
        )}

        {step === 4 && (
          <form onSubmit={handleSubmit(onNext)}>
            <h2 style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}>Compétences et Objectifs professionnels</h2>
            <br />

            <CustomInputCheckbox register={register} name={"skills"}
              label={'Compétences (sélectionnez toutes celles qui vous décrivent) :'}
              options={enums.SkillsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
            />
            <CustomInputCheckbox register={register} name={"career_goals"}
              label={'Objectifs professionnels (sélectionnez vos aspirations) :'}
              options={enums.CareerGoalsEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
            />
            <div className="button-group">
              <button type="button" onClick={handlePrevious}>Précédent</button>
              <button type="submit">Suivant</button>
            </div>
          </form>
        )}

        {step === 5 && (
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
                options={enums.LangEnum.map(subject => ({ value: subject, label: formatEnumLabel(subject) }))}
              />
            )}

            <p style={{ marginBottom: '12px' }}>Contraintes personnelles (sélectionnez toutes celles qui s'appliquent) :</p>
            <select {...register("constraints")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              {enums.ConstraintsEnum.map((constraint, idx) => (
                <option key={idx} value={constraint}>{formatEnumLabel(constraint)}</option>
              ))}
            </select>
              
            <p style={{ marginBottom: '12px' }}>Quel est votre type de personnalité ?</p>
            <select {...register("personality_profile")} required style={{ marginBottom: '16px' }}>
              <option value="">Sélectionne une option</option>
              {enums.PersonalityProfileEnum.map((item, idx) => (
                <option key={idx} value={item}>{formatEnumLabel(item)}</option>
              ))}
            </select>

            <div className="button-group">
              <button type="button" onClick={handlePrevious}>Précédent</button>
              <button type="submit">Suivant</button>
            </div>
          </form>
        )}

        {step === 6 && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <h3>Confirmation</h3>
            <p>Vous êtes sur le point de soumettre votre orientation gratuite.</p>
            <div className="button-group">
              <button type="button" onClick={handlePrevious}>Précédent</button>
              <button type="submit">Valider</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default GuestOrientationForm;
