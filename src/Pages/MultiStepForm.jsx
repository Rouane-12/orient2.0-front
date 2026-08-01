import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import '../style/MultiStepForm.scss';
import ProgressBar from '../component/ProgressBar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CustomInputCheckbox, CustomInputRadio } from '../uikits/form/choices';
import { CustomInputFile } from '../uikits/form/file';
import { SvgSpinners6DotsRotate } from '../uikits/Icons';
import PaymentModal from '../components/PaymentModal';
import API_BASE_URL from '../config/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const config = {
  seconde: [
    { label: "Bulletins Seconde", fields: ["second_year_report_data_1", "second_year_report_data_2"] },
    { label: "Bulletins Première", fields: ["first_year_report_data_1", "first_year_report_data_2"] },
    { label: "Bulletins Terminale", fields: ["final_year_report_data_1", "final_year_report_data_2"] },
  ],
  premiere: [
    { label: "Bulletins Première", fields: ["first_year_report_data_1", "first_year_report_data_2"] },
    { label: "Bulletins Terminale", fields: ["final_year_report_data_1", "final_year_report_data_2"] },
  ],
  terminale: [
    { label: "Bulletins Terminale", fields: ["final_year_report_data_1", "final_year_report_data_2"] },
  ]
};

const FILE_FIELDS = [
  "second_year_report_data_1",
  "second_year_report_data_2",
  "first_year_report_data_1",
  "first_year_report_data_2",
  "final_year_report_data_1",
  "final_year_report_data_2",
  "final_exam_data"
];

function OrientationForm() {
  const TOTAL_STEPS = 6;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [userData, setUD] = useState();
  const [enums, setEnums] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const filesRef = useRef({});
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
    },
  });

  const selected = watch("upload_choice");
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
    const checkPaymentStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('No access token found');
          return;
        }
        
        const response = await axios.get(`${API_BASE_URL}api/payment/check-user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHasPaid(response.data.hasPaid);
      } catch (error) {
        console.error('Error checking payment status:', error);
        // Don't automatically logout on payment check failure
      }
    };
    checkPaymentStatus();
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

    extractAndSaveFiles(data);

    const finalData = { ...formData, ...data };

    const requiredFiles = ["final_year_report_data_1", "final_year_report_data_2", "final_exam_data"];
    const missingFiles = requiredFiles.filter(field => !filesRef.current[field]);

    if (missingFiles.length > 0) {
      toast.error(`Fichiers manquants : ${missingFiles.join(', ')}`);
      return;
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

      let errorMessage = "Une erreur est survenue. Vérifie la console.";

      if (err.code === 'ERR_NETWORK') {
        errorMessage = "Erreur de connexion : Assurez-vous que le serveur backend est démarré sur http://localhost:5200 !";
      } else if (err.message.includes('ERR_UPLOAD_FILE_CHANGED')) {
        errorMessage = "Erreur avec un fichier : Réessayez de sélectionner les fichiers avant de soumettre !";
      } else if (err.response) {
        errorMessage = `Erreur serveur : ${err.response.statusText} (${err.response.status})`;
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
          <form onSubmit={handleSubmit(onNext)}>
            <h3>Informations personnelles</h3>
            <p>Bienvenue {user?.firstname || ''} ! Vos informations personnelles sont déjà enregistrées.</p>
            <div className="button-group">
              <button type="submit">Suivant</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit(onNext)}>
            <h3>Preference et Documents scolaires</h3>
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

            {selected && config[selected].map((section, index) => (
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

            <div className="button-group">
              <button type="button" onClick={handlePrevious}>Précédent</button>
              <button type="submit">Suivant</button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit(onNext)}>
            <h3>Centre d'intérêt</h3>
            <select {...register("interest_center")} required>
              <option value="">Sélectionne une option</option>
              {enums.InterestCenterEnum.map((item, idx) => (
                <option key={idx} value={item}>{item}</option>
              ))}
            </select>

            <CustomInputCheckbox register={register} name={"school_favorite_subject"}
              label={'Matières préférées :'}
              options={enums.FavoriteSubjectsEnum.map(subject => ({ value: subject, label: subject }))}
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

            <CustomInputCheckbox register={register} name={"skills"}
              label={'Compétences :'}
              options={enums.SkillsEnum.map(subject => ({ value: subject, label: subject }))}
            />
            <CustomInputCheckbox register={register} name={"career_goals"}
              label={'Objectifs professionnels :'}
              options={enums.CareerGoalsEnum.map(subject => ({ value: subject, label: subject }))}
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
                label={'Langues :'}
                options={enums.LangEnum.map(subject => ({ value: subject, label: subject }))}
              />
            )}

            <p>Contraintes personnelles :</p>
            <select {...register("constraints")} required>
              <option value="">Sélectionne une option</option>
              {enums.ConstraintsEnum.map((constraint, idx) => (
                <option key={idx} value={constraint}>{constraint}</option>
              ))}
            </select>
              
            <p>Quel est votre type de personnalité ? :</p>
            <select {...register("personality_profile")} required>
              <option value="">Sélectionne une option</option>
              {enums.PersonalityProfileEnum.map((item, idx) => (
                <option key={idx} value={item}>{item}</option>
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
            <h3>Style de travail & Préférences</h3>
            
            <p>Quel est ton style de travail préféré ?</p>
            <select {...register("work_style")} required>
              <option value="">Sélectionne une option</option>
              <option value="autonome">Travail autonome et indépendant</option>
              <option value="equipe">Travail en équipe collaboratif</option>
              <option value="mixte">Mixte (autonome et équipe)</option>
              <option value="encadre">Travail encadré avec supervision</option>
            </select>

            <p>Quel environnement de travail te convient le mieux ?</p>
            <select {...register("work_environment")} required>
              <option value="">Sélectionne une option</option>
              <option value="bureau">En bureau / espace de travail</option>
              <option value="exterieur">En extérieur / terrain</option>
              <option value="distance">Télétravail / distance</option>
              <option value="variable">Environnement variable</option>
            </select>

            <p>Quel niveau de responsabilité recherches-tu ?</p>
            <select {...register("responsibility_level")} required>
              <option value="">Sélectionne une option</option>
              <option value="execution">Rôle d'exécution / tâches définies</option>
              <option value="gestion">Rôle de gestion / coordination</option>
              <option value="decision">Rôle de décision / stratégie</option>
              <option value="leadership">Rôle de leadership / direction</option>
            </select>

            <p>Quel est ton style d'apprentissage ?</p>
            <select {...register("learning_style")} required>
              <option value="">Sélectionne une option</option>
              <option value="theorique">Théorique / académique</option>
              <option value="pratique">Pratique / terrain</option>
              <option value="visuel">Visuel / démonstrations</option>
              <option value="mixte">Mixte (théorie et pratique)</option>
            </select>

            <div className="button-group">
              <button type="button" onClick={handlePrevious}>Précédent</button>
              <button type="submit">Valider</button>
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