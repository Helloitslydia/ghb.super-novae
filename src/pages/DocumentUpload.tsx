import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  Trash2,
  Plus,
  Save,
  Send
} from 'lucide-react';
import { toast } from 'sonner';
import SignaturePad from '../components/SignaturePad';

interface DocumentItem {
  key: string;
  label: string;
  required: boolean;
}

const baseDocuments: DocumentItem[] = [
  { key: 'avis_siret', label: 'Avis de situation au r\xE9pertoire SIRET', required: true },
  { key: 'kbis', label: 'K-bis', required: true },
  { key: 'devis', label: "Devis des fournisseurs/installateurs, obligatoire si l'option 4 ou 5 est choisie", required: false },
];

interface UploadedFile {
  file: File;
  preview?: string;
}

interface FormDataState {
  siret: string;
  pacage: string;
  ede: string;
  inuav1: string;
  inuav2: string;
  inuav3: string;
  nom: string;
  statut: string;
  adresse: string;
  code_postal: string;
  commune: string;
  tel_fixe: string;
  tel_mobile: string;
  email: string;
  affiliation_msa: boolean;
  besoin_equipement: string;
  sau_totale: string;
  production_maraichage: boolean;
  surface_maraichage: string;
  surface_plantes_parfum_medicinales: string;
  production_bovins: boolean;
  bovins_nombre: string;
  production_volailles: boolean;
  volailles_effectif: string;
  autres_production: string;
  besoin_actuel: string;
  besoin_prospectif: string;
  capacite_actuelle: string;
  detail_stockage: string;
  capacite_besoins_actuels: string;
  capacite_besoins_prospectifs: string;
  volume_total_investissement: string;
  micro_surface: string;
  micro_volume: string;
  cuve_nombre: string;
  cuve_vol_unitaire: string;
  cuve_vol_total: string;
  citerne_nombre: string;
  citerne_vol_unitaire: string;
  citerne_vol_total: string;
  water_tank_volume: string;
  volume_stockage_actuel: string;
  volume_stockage_total_post: string;
  surface_impluvium: string;
  cout_total_projet: string;
  depense_nature: string;
  depense_cout: string;
  depense_terrassement: string;
  depense_pose: string;
  depense_raccordement: string;
  depense_pompage: string;
  commentaire_projet: string;
  status: string;
  created_at?: string;
  attestation: boolean;
}

const optionalFields: (keyof FormDataState)[] = [
  'besoin_equipement',
  'ede',
  'inuav1',
  'inuav2',
  'inuav3',
  'sau_totale',
  'production_maraichage',
  'surface_maraichage',
  'surface_plantes_parfum_medicinales',
  'production_bovins',
  'bovins_nombre',
  'production_volailles',
  'volailles_effectif',
  'autres_production',
  'besoin_actuel',
  'besoin_prospectif',
  'capacite_actuelle',
  'detail_stockage',
  'capacite_besoins_actuels',
  'capacite_besoins_prospectifs',
  'volume_total_investissement',
  'micro_surface',
  'micro_volume',
  'cuve_nombre',
  'cuve_vol_unitaire',
  'cuve_vol_total',
  'citerne_nombre',
  'citerne_vol_unitaire',
  'citerne_vol_total',
  'water_tank_volume',
  'volume_stockage_actuel',
  'volume_stockage_total_post',
  'surface_impluvium',
  'cout_total_projet',
  'depense_nature',
  'depense_cout',
  'depense_terrassement',
  'depense_pose',
  'depense_raccordement',
  'depense_pompage',
  'commentaire_projet',
];

const fieldLabels: Record<string, string> = {
  siret: 'N° SIRET',
  pacage: 'N° PACAGE',
  ede: 'N° EDE',
  inuav1: 'N° INUAV 1',
  inuav2: 'N° INUAV 2',
  inuav3: 'N° INUAV 3',
  nom: 'Nom / raison sociale',
  statut: 'Statut juridique',
  adresse: 'Adresse',
  code_postal: 'Code postal',
  commune: 'Commune',
  tel_fixe: 'Téléphone fixe',
  tel_mobile: 'Téléphone mobile',
  email: 'Email',
  attestation: 'Autorisation de transmission des données',
  signature: 'Signature',
};

const initialFormData: FormDataState = {
  siret: '',
  pacage: '',
  ede: '',
  inuav1: '',
  inuav2: '',
  inuav3: '',
  nom: '',
  statut: '',
  adresse: '',
  code_postal: '',
  commune: '',
  tel_fixe: '',
  tel_mobile: '',
  email: '',
  affiliation_msa: false,
  besoin_equipement: '',
  sau_totale: '',
  production_maraichage: false,
  surface_maraichage: '',
  surface_plantes_parfum_medicinales: '',
  production_bovins: false,
  bovins_nombre: '',
  production_volailles: false,
  volailles_effectif: '',
  autres_production: '',
  besoin_actuel: '',
  besoin_prospectif: '',
  capacite_actuelle: '',
  detail_stockage: '',
  capacite_besoins_actuels: '',
  capacite_besoins_prospectifs: '',
  volume_total_investissement: '',
  micro_surface: '',
  micro_volume: '',
  cuve_nombre: '',
  cuve_vol_unitaire: '',
  cuve_vol_total: '',
  citerne_nombre: '',
  citerne_vol_unitaire: '',
  citerne_vol_total: '',
  water_tank_volume: '',
  volume_stockage_actuel: '',
  volume_stockage_total_post: '',
  surface_impluvium: '',
  cout_total_projet: '',
  depense_nature: '',
  depense_cout: '',
  depense_terrassement: '',
  depense_pose: '',
  depense_raccordement: '',
  depense_pompage: '',
  commentaire_projet: '',
  status: 'Brouillon',
  created_at: '',
  attestation: false,
};

// Mapping of equipment options to their corresponding images
const optionValues = [
  "Type 1 : pour les exploitations peu accessibles, sans abri ni bâti, ou un besoin en eau plutôt saisonnier ou complémentaire. La prestation comprend l'installation d'un abri en bambou (entre 10et20m2), des installations de récupération d'eau de pluie, et matériel pour irrigation adapté. Fourni par Agrikania.",
  "Type 2 : pour les exploitations accessibles pour terrassement, besoin en eau régulier. La prestation comprend l'installation de récupération d'eau de pluie (avec ou sans abri bambou), réseau d'irrigation avec citerne adaptés, matériel…. Fourni par Agrikania.",
  "Type 3 : pour exploitations accessibles et besoin en eau important, cette prestation comprend l'installation de watertank pour la récupération de gros volumes d'eau de pluie, adapté au besoin et possibilité terrain. Fourni par Agrikania.",
  'Type 4 : Réparation après sinistre, sur devis',
  'Type 5 : Solution sur-mesure à vos besoins, sur devis',
];

const optionImages = [
  '//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1752653583836x934047329531718700/Capture%20d%E2%80%99e%CC%81cran%202025-07-11%20a%CC%80%203.06.53%E2%80%AFPM.png',
  '//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1752653625630x801815760041798500/Capture%20d%E2%80%99e%CC%81cran%202025-07-11%20a%CC%80%203.07.06%E2%80%AFPM.png',
  '//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1752653650999x744393386646182300/Capture%20d%E2%80%99e%CC%81cran%202025-07-11%20a%CC%80%203.07.12%E2%80%AFPM.png',
  '//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1752653693512x780032431822349700/Capture%20d%E2%80%99e%CC%81cran%202025-07-11%20a%CC%80%204.30.22%E2%80%AFPM.png',
  '//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1752653716020x599785238027283900/Capture%20d%E2%80%99e%CC%81cran%202025-07-11%20a%CC%80%204.30.27%E2%80%AFPM.png',
];

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  wrapperClassName?: string;
}

const TextInputField: React.FC<InputProps> = ({
  label,
  required,
  wrapperClassName,
  className,
  ...props
}) => (
  <div className={wrapperClassName}>
    <label className="block mb-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      {...props}
      required={required}
      className={`border p-2 rounded w-full ${className || ''}`.trim()}
    />
  </div>
);

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  wrapperClassName?: string;
}

const TextAreaField: React.FC<TextAreaProps> = ({
  label,
  required,
  wrapperClassName,
  className,
  ...props
}) => (
  <div className={wrapperClassName}>
    <label className="block mb-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      {...props}
      required={required}
      className={`border p-2 rounded w-full ${className || ''}`.trim()}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  wrapperClassName?: string;
}

const SelectField: React.FC<SelectProps> = ({
  label,
  required,
  wrapperClassName,
  className,
  children,
  ...props
}) => (
  <div className={wrapperClassName}>
    <label className="block mb-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <select
      {...props}
      required={required}
      className={`border p-2 rounded w-full ${className || ''}`.trim()}
    >
      {children}
    </select>
  </div>
);

interface RadioGroupProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  wrapperClassName?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  required,
  wrapperClassName,
}) => (
  <div className={wrapperClassName}>
    <label className="block mb-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="space-y-2">
      {options.map(option => (
        <label key={option} className="flex items-center space-x-2">
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={onChange}
            required={required}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </div>
);

function DocumentUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState<Record<string, UploadedFile>>({});
  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [completionRate, setCompletionRate] = useState(0);
  const [signature, setSignature] = useState<string | null>(null);

  const isDevisRequired =
    formData.besoin_equipement === optionValues[3] ||
    formData.besoin_equipement === optionValues[4];

  const documents = useMemo(
    () =>
      baseDocuments.map(doc =>
        doc.key === 'devis' ? { ...doc, required: isDevisRequired } : doc
      ),
    [isDevisRequired]
  );

  useEffect(() => {
    const requiredDocs = documents.filter(d => d.required);
    const uploadedRequired = requiredDocs.filter(d => files[d.key]);
    const rate = (uploadedRequired.length / requiredDocs.length) * 100;
    setCompletionRate(rate);
  }, [files, documents]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('project_applications')
        .select('*')
        .eq('user_id', user.id)
        .limit(1);
      if (data && data.length > 0) {
        setFormData({ ...(data[0] as any) });
      }
    };
    loadData();
  }, [user]);

  useEffect(() => {
    const allowedStatuses = [
      'Etude du dossier en cours',
      'Validé',
      'Refusé',
      'Dossier conforme',
    ];
    const params = new URLSearchParams(location.search);
    const fromApplication = params.get('from') === 'application';
    if (
      formData.status &&
      allowedStatuses.includes(formData.status) &&
      !fromApplication
    ) {
      navigate('/application');
    }
  }, [formData.status, navigate, location.search]);

  const handleFileSelect = (key: string, selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux (max 10MB)');
        return;
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non autoris\xE9. Utilisez PDF, JPG ou PNG.');
        return;
      }
      const uploadedFile: UploadedFile = { file };
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          uploadedFile.preview = e.target?.result as string;
          setFiles(prev => ({ ...prev, [key]: uploadedFile }));
        };
        reader.readAsDataURL(file);
      } else {
        setFiles(prev => ({ ...prev, [key]: uploadedFile }));
      }
      toast.success('Fichier ajout\xE9');
    }
  };

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOver(null);
    handleFileSelect(key, e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOver(key);
  };

  const handleDragLeave = () => setDragOver(null);

  const removeFile = (key: string) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[key];
      return newFiles;
    });
  };

  const validateForm = () => {
    const allKeys = Object.keys(formData) as (keyof FormDataState)[];
    const fieldsToCheck = allKeys.filter(
      key =>
        !optionalFields.includes(key) &&
        key !== 'affiliation_msa' &&
        key !== 'status' &&
        key !== 'created_at'
    );

    const missing = fieldsToCheck.filter(key => {
      const value = formData[key];
      if (typeof value === 'boolean') return !value;
      return !value || value.trim() === '';
    });

    if (!signature) {
      missing.push('signature' as keyof FormDataState);
    }

    return missing.map(key => fieldLabels[key as string] || key);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const saveFormData = async () => {
    if (!user) return;
    const { created_at, ...data } = formData;
    const { error: upsertError } = await supabase
      .from('project_applications')
      .upsert({ user_id: user.id, ...data }, { onConflict: 'user_id' });
    if (upsertError) {
      throw upsertError;
    }
  };

  const saveFiles = async () => {
    if (!user) return;
    for (const doc of documents) {
      const uploadedFile = files[doc.key];
      if (uploadedFile) {
        const sanitizedFilename = sanitizeFilename(uploadedFile.file.name);
        const filePath = `${user.id}/${Date.now()}-${sanitizedFilename}`;
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, uploadedFile.file);
        if (uploadError) throw uploadError;
        const { error: insertError } = await supabase
          .from('user_documents')
          .insert({ user_id: user.id, doc_key: doc.key, file_path: filePath });
        if (insertError) throw insertError;
      }
    }
  };

  const dataURLToBlob = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const saveSignature = async () => {
    if (!user || !signature) return;
    const blob = dataURLToBlob(signature);
    const filePath = `${user.id}/${Date.now()}-signature.png`;
    const { error: uploadError } = await supabase.storage
      .from('signatures')
      .upload(filePath, blob);
    if (uploadError) throw uploadError;
    const { error: insertError } = await supabase
      .from('user_documents')
      .insert({ user_id: user.id, doc_key: 'signature', file_path: filePath });
    if (insertError) throw insertError;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFormData();
      await saveFiles();
      await saveSignature();
      toast.success('Donn\xE9es sauvegard\xE9es');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const missingFields = validateForm();
    if (missingFields.length > 0) {
      alert('Veuillez renseigner les champs suivants :\n' + missingFields.join('\n'));
      return;
    }
    const missingRequired = documents.filter(d => d.required && !files[d.key]);
    if (missingRequired.length > 0) {
      toast.error('Veuillez téléverser tous les documents requis');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await handleSave();
      await supabase
        .from('project_applications')
        .update({ status: 'Etude du dossier en cours' })
        .eq('user_id', user.id);
      setFormData(prev => ({ ...prev, status: 'Etude du dossier en cours' }));
      setSuccess(true);
      toast.success('Dossier d\xE9pos\xE9');
      navigate('/application');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du d\xE9p\xF4t';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <FileText className="w-8 h-8 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const sanitizeFilename = (filename: string) => {
    // Remove or replace problematic characters for Supabase storage
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace any non-alphanumeric characters (except dots and hyphens) with underscores
      .replace(/_{2,}/g, '_') // Replace multiple consecutive underscores with a single underscore
      .replace(/^_+|_+$/g, ''); // Remove leading and trailing underscores
  };

  // Determine which image to display for the selected option
  const selectedOptionIndex = optionValues.indexOf(formData.besoin_equipement);
  const selectedImage =
    selectedOptionIndex !== -1 ? optionImages[selectedOptionIndex] : null;


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" /> Retour
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Déposez votre dossier</h1>
                <p className="text-gray-600">Complétez les informations et Téléversez vos fichiers</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Progression</div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${completionRate}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{Math.round(completionRate)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Instructions importantes</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>- Les documents marqués d'un astérisque (*) sont obligatoires</li>
                <li>- Formats acceptés : PDF, JPG, PNG (max 10MB)</li>
                <li>- Vous pouvez sauvegarder votre progression</li>
              </ul>
              <p className="text-blue-800 text-sm mt-2">
                En cas de question, vous pouvez contacter Sabri
                (sabri.benhassine@super-novae.org) ou Hana
                (hana.benali@super-novae.org).
              </p>
            </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <p className="mb-2">
          Bienvenue sur votre espace. GBH et Super-Novae s'engagent ensemble aux
          cotés des agriculteurs mahorais, en mettant en place un fonds de
          soutien pour renforcer leur résilience à la sécheresse. Ce programme
          vise à financer l’acquisition d’équipements de récupération et de
          stockage des eaux pluviales à usage agricole.
        </p>
        <p className="font-semibold">Il vise à :</p>
        <ul className="list-disc list-inside mb-2">
          <li>
            Renforcer la résilience des exploitations agricoles face au stress
            hydrique
          </li>
          <li>Promouvoir des pratiques agricoles durables</li>
          <li>
            Générer un impact environnemental et économique positif à l’échelle
            locale
          </li>
        </ul>
        <a
          href="//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1752595547555x783891127073297300/Brochure%20Appel%20a%CC%80%20projets%20-%20GBH%20%281%29.pdf"
          target="_blank"
          rel="noopener noreferrer"
          download
          className="mt-2 inline-block text-[#2D6A4F] hover:text-[#1B4332] underline"
        >
          En savoir plus
        </a>
        <p>
          Nous vous remercions de remplir les éléments ci dessous pour que
          votre dossier soit évalué.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Partie 1 : Votre exploitation en détails</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <TextInputField label="N° SIRET" name="siret" value={formData.siret} onChange={handleChange} required />
              <TextInputField label="N° PACAGE" name="pacage" value={formData.pacage} onChange={handleChange} required />
              <TextInputField label="N° EDE" name="ede" value={formData.ede} onChange={handleChange} />
              <TextInputField label="N° INUAV 1" name="inuav1" value={formData.inuav1} onChange={handleChange} />
              <TextInputField label="N° INUAV 2" name="inuav2" value={formData.inuav2} onChange={handleChange} />
              <TextInputField label="N° INUAV 3" name="inuav3" value={formData.inuav3} onChange={handleChange} />
              <TextInputField label="Nom / raison sociale" name="nom" value={formData.nom} onChange={handleChange} required />
              <TextInputField label="Statut juridique" name="statut" value={formData.statut} onChange={handleChange} required />
              <TextAreaField label="Adresse" name="adresse" value={formData.adresse} onChange={handleChange} wrapperClassName="md:col-span-2" required />
              <TextInputField label="Code postal" name="code_postal" value={formData.code_postal} onChange={handleChange} required />
              <TextInputField label="Commune" name="commune" value={formData.commune} onChange={handleChange} required />
              <TextInputField label="Téléphone fixe" name="tel_fixe" value={formData.tel_fixe} onChange={handleChange} required />
              <TextInputField label="Téléphone mobile" name="tel_mobile" value={formData.tel_mobile} onChange={handleChange} required />
              <TextInputField label="Email" name="email" value={formData.email} onChange={handleChange} wrapperClassName="md:col-span-2" required />
              <label className="flex items-center space-x-2 md:col-span-2">
                <input type="checkbox" name="affiliation_msa" checked={formData.affiliation_msa} onChange={handleChange} />
                  <span>Je certifie que je suis affilé à la MSA en date du 31/03/2025 et accepte que cette information soit vérfiée par Super Novae directement auprès de la caisse</span>
                </label>
            </div>
          </div>

          <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Partie 2 :  Votre projet: Eau et résilience</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <RadioGroup
                  label="Pour plus de simplicité, vous pouvez choisir parmi 5 types de soutien. Les 3 premières sont standardisées et ne nécessitent pas de devis. Les 2 autres sont personnalisées, et doivent faire l’objet d’un devis."
                  name="besoin_equipement"
                  value={formData.besoin_equipement}
                  onChange={handleChange}
                  options={optionValues}
                  required
                />
                {selectedImage && (
                  <div className="mt-4">
                    <img
                      src={selectedImage}
                      alt="Aperçu équipement"
                      className="w-full max-w-md mx-auto"
                    />
                  </div>
                )}
              </div>
              <TextInputField label="SAU totale (ha)" name="sau_totale" value={formData.sau_totale} onChange={handleChange} />
              <div className="flex items-center gap-4 md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="production_maraichage" checked={formData.production_maraichage} onChange={handleChange} />
                  <span>Maréchage</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="production_bovins" checked={formData.production_bovins} onChange={handleChange} />
                  <span>Bovins</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" name="production_volailles" checked={formData.production_volailles} onChange={handleChange} />
                  <span>Volailles</span>
                </label>
              </div>
              <TextInputField label="Surface maréchage (ha)" name="surface_maraichage" value={formData.surface_maraichage} onChange={handleChange} />
              <TextInputField
                label="Surface plantes à parfum et médicinales (ha)"
                name="surface_plantes_parfum_medicinales"
                value={formData.surface_plantes_parfum_medicinales}
                onChange={handleChange}
              />
              <TextInputField label="Nombre bovins" name="bovins_nombre" value={formData.bovins_nombre} onChange={handleChange} />
              <TextInputField label="Effectif volailles" name="volailles_effectif" value={formData.volailles_effectif} onChange={handleChange} />
              <TextInputField label="Autres productions" name="autres_production" value={formData.autres_production} onChange={handleChange} wrapperClassName="md:col-span-2" />
              <TextInputField label="Besoin stockage actuel (m3)" name="besoin_actuel" value={formData.besoin_actuel} onChange={handleChange} />
              <TextInputField label="Besoin stockage prospectif (m3)" name="besoin_prospectif" value={formData.besoin_prospectif} onChange={handleChange} />
              <TextInputField label="Capacité actuelle (m3)" name="capacite_actuelle" value={formData.capacite_actuelle} onChange={handleChange} />
              <TextAreaField label="Détail du stockage actuel" name="detail_stockage" value={formData.detail_stockage} onChange={handleChange} wrapperClassName="md:col-span-2" />
              <TextInputField label="Capacité nécessaire (actuels)" name="capacite_besoins_actuels" value={formData.capacite_besoins_actuels} onChange={handleChange} />
              <TextInputField label="Capacité nécessaire (moyen terme)" name="capacite_besoins_prospectifs" value={formData.capacite_besoins_prospectifs} onChange={handleChange} />
              <TextInputField label="Volume stockage total invest. (m3)" name="volume_total_investissement" value={formData.volume_total_investissement} onChange={handleChange} />
              <TextInputField label="Micro-bassine surface (m2)" name="micro_surface" value={formData.micro_surface} onChange={handleChange} />
              <TextInputField label="Micro-bassine volume (m3)" name="micro_volume" value={formData.micro_volume} onChange={handleChange} />
              <TextInputField label="Cuve nombre" name="cuve_nombre" value={formData.cuve_nombre} onChange={handleChange} />
              <TextInputField label="Cuve volume unitaire (m3)" name="cuve_vol_unitaire" value={formData.cuve_vol_unitaire} onChange={handleChange} />
              <TextInputField label="Cuve volume total (m3)" name="cuve_vol_total" value={formData.cuve_vol_total} onChange={handleChange} />
              <TextInputField label="Citerne souple nombre" name="citerne_nombre" value={formData.citerne_nombre} onChange={handleChange} />
              <TextInputField label="Citerne vol. unitaire (m3)" name="citerne_vol_unitaire" value={formData.citerne_vol_unitaire} onChange={handleChange} />
              <TextInputField label="Citerne vol. total (m3)" name="citerne_vol_total" value={formData.citerne_vol_total} onChange={handleChange} />
              <TextInputField label="Water-tank volume (m3)" name="water_tank_volume" value={formData.water_tank_volume} onChange={handleChange} />
              <TextInputField label="Volume stockage actuel" name="volume_stockage_actuel" value={formData.volume_stockage_actuel} onChange={handleChange} />
              <TextInputField label="Volume stockage total après" name="volume_stockage_total_post" value={formData.volume_stockage_total_post} onChange={handleChange} />
              <TextInputField label="Surface d'impluvium (m2)" name="surface_impluvium" value={formData.surface_impluvium} onChange={handleChange} />
              <TextInputField label="Coût total du projet" name="cout_total_projet" value={formData.cout_total_projet} onChange={handleChange} />
              <TextInputField label="Nature dépense" name="depense_nature" value={formData.depense_nature} onChange={handleChange} />
              <TextInputField label="Coût dépense" name="depense_cout" value={formData.depense_cout} onChange={handleChange} />
              <TextInputField label="Terrassement coût" name="depense_terrassement" value={formData.depense_terrassement} onChange={handleChange} />
              <TextInputField label="Pose coût" name="depense_pose" value={formData.depense_pose} onChange={handleChange} />
              <TextInputField label="Raccordement coût" name="depense_raccordement" value={formData.depense_raccordement} onChange={handleChange} />
              <TextInputField label="Pompage coût" name="depense_pompage" value={formData.depense_pompage} onChange={handleChange} />
              <TextAreaField
                label="Décrivez votre projet avec le plus de détails possible, notamment l’impact de la demande d’équipement sur votre exploitation et sur votre production. Soyez le plus précis possible"
                name="commentaire_projet"
                value={formData.commentaire_projet}
                onChange={handleChange}
                rows={6}
                wrapperClassName="md:col-span-2"
              />
            </div>
          </div>

          <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Dossier complet : Pièces à joindre</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {documents.map(doc => {
                const uploadedFile = files[doc.key];
                const isUploaded = !!uploadedFile;
                return (
                  <div key={doc.key} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 flex items-center">
                          {doc.label}
                          {doc.required && <span className="text-red-500 ml-1">*</span>}
                          {isUploaded && <CheckCircle className="w-4 h-4 text-green-500 ml-2" />}
                        </h3>
                      </div>
                    </div>
                    {!isUploaded ? (
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center ${dragOver === doc.key ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                        onDrop={e => handleDrop(e, doc.key)}
                        onDragOver={e => handleDragOver(e, doc.key)}
                        onDragLeave={handleDragLeave}
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Glissez-déposez ou</p>
                        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer">
                          <Plus className="w-4 h-4 mr-2" /> Choisir un fichier
                          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleFileSelect(doc.key, e.target.files)} />
                        </label>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(uploadedFile.file)}
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{uploadedFile.file.name}</p>
                              <p className="text-xs text-gray-600">{formatFileSize(uploadedFile.file.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {uploadedFile.preview && (
                              <button type="button" onClick={() => window.open(uploadedFile.preview, '_blank')} className="p-1 text-gray-400 hover:text-blue-600" title="Aper\u00E7u">
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <button type="button" onClick={() => removeFile(doc.key)} className="p-1 text-gray-400 hover:text-red-600" title="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Partie 4 : Engagement et déclaration</h2>
            <div className="space-y-2">
              <div>
              <label className="block mb-1">
                Je soussigné(e) (nom et prénom) :<span className="text-red-500">*</span>
              </label>
              <input className="border p-2 rounded w-full" type="text" required />
              </div>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">Certifie avoir pouvoir pour représenter le demandeur dans le cadre de la présente formalité ;<span className="text-red-500">*</span></span>
              </label>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">Certifie l'ensemble des informations fournies dans le présent formulaire et les pièces jointes.<span className="text-red-500">*</span></span>
              </label>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">Je suis informé qu'en cas d'irrégularité ou de non-respect de mes engagements, le remboursement des sommes perçues sera exigé, majoré d'intérêts de retard et éventuellement de pénalités financières, sans exclure d'autres poursuites et sanctions prévues par les textes en vigueur.<span className="text-red-500">*</span></span>
              </label>
              <p className="font-semibold mt-2">Je déclare :</p>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">ne pas disposer de forage sur mon exploitation et ne pas avoir engagé de démarche pour en disposer.<span className="text-red-500">*</span></span>
              </label>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">que mon projet ne nécessite ni permis de construire ni autorisation environnementale « Loi sur l’eau ».<span className="text-red-500">*</span></span>
              </label>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">Je demande à bénéficier de l’aide aux investissements visant à renforcer la résistance à la sécheresse des exploitations agricoles mahoraises via l’acquisition d’équipements de récupération et de stockage des eaux pluviales à usage agricole.<span className="text-red-500">*</span></span>
              </label>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">Je m’engage à ce que mon projet soit réalisé au plus tard le 15 septembre 2025 (mise en œuvre opérationnelle avec raccordement aux impluviums)<span className="text-red-500">*</span></span>
              </label>
              <p className="font-semibold mt-2">Je m'engage, sous réserve d'attribution de l'aide :</p>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">À délivrer tout document ou justificatif demandé par le bailleur pendant 3 années ;<span className="text-red-500">*</span></span>
              </label>
              <p className="font-semibold mt-2">Protection des données personnelles :</p>
              <label className="flex items-start space-x-2">
                <input type="checkbox" name="attestation" checked={formData.attestation} onChange={handleChange} required />
                <span className="flex-1">J’autorise les organismes tiers (Direction des finances publiques, MSA, DAAF, fournisseurs des équipements financés par l’appel à projet.) à transmettre à GBH ou son partenaire de mise en œuvre Super Novae les données utiles à l’instruction et au paiement de la présente demande d’aide.<span className="text-red-500">*</span></span>
              </label>
              <div className="mt-2 space-y-2">
                <div>
                  Fait le <input type="text" className="border p-2 rounded mx-2" placeholder="JJ/MM/AAAA" required /> <span className="text-red-500">*</span> Signature(s) (de tous les associés si GAEC) :
                </div>
                <SignaturePad value={signature} onChange={setSignature} />
                <p>Signature</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-green-800">Dossier d\xE9pos\xE9 avec succ\xE8s !</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <button type="button" onClick={handleSave} disabled={saving} className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                <Save className="w-5 h-5 mr-2" /> {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button type="submit" disabled={loading || completionRate < 100} className="flex items-center justify-center px-8 py-3 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1B4332]">
                <Send className="w-5 h-5 mr-2" /> {loading ? 'Envoi...' : 'D\xE9poser le dossier'}
              </button>
            </div>
            {completionRate < 100 && <p className="text-sm text-gray-600 mt-3 text-center">Veuillez téléverser tous les documents requis</p>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default DocumentUpload;
