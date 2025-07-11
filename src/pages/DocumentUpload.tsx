import React, { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const documents: DocumentItem[] = [
  { key: 'rib', label: "Relev\xE9 d'identit\xE9 bancaire", required: true },
  { key: 'avis_siret', label: 'Avis de situation au r\xE9pertoire SIRET', required: true },
  { key: 'kbis', label: 'K-bis', required: true },
  { key: 'devis', label: 'Devis des fournisseurs/installateurs', required: true }
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

function DocumentUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<Record<string, UploadedFile>>({});
  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [completionRate, setCompletionRate] = useState(0);
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    const requiredDocs = documents.filter(d => d.required);
    const uploadedRequired = requiredDocs.filter(d => files[d.key]);
    const rate = (uploadedRequired.length / requiredDocs.length) * 100;
    setCompletionRate(rate);
  }, [files]);

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
    ];
    if (formData.status && allowedStatuses.includes(formData.status)) {
      navigate('/application');
    }
  }, [formData.status, navigate]);

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
        <p>
          Nous vous remercions de remplir les éléments ci dessous pour que
          votre dossier soit évalué.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Partie 1 : Votre exploitation</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input name="siret" value={formData.siret} onChange={handleChange} className="border p-2 rounded" placeholder="N° SIRET" required />
              <input name="pacage" value={formData.pacage} onChange={handleChange} className="border p-2 rounded" placeholder="N° PACAGE" required />
              <input name="ede" value={formData.ede} onChange={handleChange} className="border p-2 rounded" placeholder="N° EDE" required />
              <input name="inuav1" value={formData.inuav1} onChange={handleChange} className="border p-2 rounded" placeholder="N° INUAV 1" required />
              <input name="inuav2" value={formData.inuav2} onChange={handleChange} className="border p-2 rounded" placeholder="N° INUAV 2" required />
              <input name="inuav3" value={formData.inuav3} onChange={handleChange} className="border p-2 rounded" placeholder="N° INUAV 3" required />
              <input name="nom" value={formData.nom} onChange={handleChange} className="border p-2 rounded" placeholder="Nom / raison sociale" required />
              <input name="statut" value={formData.statut} onChange={handleChange} className="border p-2 rounded" placeholder="Statut juridique" required />
              <textarea name="adresse" value={formData.adresse} onChange={handleChange} className="border p-2 rounded md:col-span-2" placeholder="Adresse" required />
              <input name="code_postal" value={formData.code_postal} onChange={handleChange} className="border p-2 rounded" placeholder="Code postal" required />
              <input name="commune" value={formData.commune} onChange={handleChange} className="border p-2 rounded" placeholder="Commune" required />
              <input name="tel_fixe" value={formData.tel_fixe} onChange={handleChange} className="border p-2 rounded" placeholder="Téléphone fixe" required />
              <input name="tel_mobile" value={formData.tel_mobile} onChange={handleChange} className="border p-2 rounded" placeholder="Téléphone mobile" required />
              <input name="email" value={formData.email} onChange={handleChange} className="border p-2 rounded md:col-span-2" placeholder="Email" required />
              <label className="flex items-center space-x-2 md:col-span-2">
                <input type="checkbox" name="affiliation_msa" checked={formData.affiliation_msa} onChange={handleChange} />
                  <span>Je certifie que je suis affilé à la MSA en date du 31/03/2025 et accepte que cette information soit vérfiée par Super Novae directement auprès de la caisse</span>
                </label>
            </div>
          </div>

          <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Partie 2 : Votre projet</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <p className="font-medium mb-2">Choisissez l&apos;option qui se rapproche le plus de votre situation</p>
                <select
                  name="besoin_equipement"
                  value={formData.besoin_equipement}
                  onChange={handleChange}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Sélectionnez une option</option>
                  <option value="j’ai besoin de reconstruction des équipements détériorés">
                    j’ai besoin de reconstruction des équipements détériorés
                  </option>
                  <option value="j’ai besoin d’une petite structure en bambou pour récolter et conserver l’eau de petites et moyennes exploitations">
                    j’ai besoin d’une petite structure en bambou pour récolter et conserver l’eau de petites et moyennes exploitations
                  </option>
                  <option value="j’ai besoin d’équipements et de gros réservoirs pour récolter et conserver l’eau de pluie (moyennes et grandes exploitations)">
                    j’ai besoin d’équipements et de gros réservoirs pour récolter et conserver l’eau de pluie (moyennes et grandes exploitations)
                  </option>
                  <option value="j’ai besoins de gros équipement et de grosses citernes (grandes exploitations)">
                    j’ai besoins de gros équipement et de grosses citernes (grandes exploitations)
                  </option>
                  <option value="aucune de ces options, nos correspond à mon besoin, je joins un devis personnalisé">
                    Aucune de ces options ne correspond à mon besoin, je joins un devis personnalisé
                  </option>
                </select>
              </div>
              <input name="sau_totale" value={formData.sau_totale} onChange={handleChange} className="border p-2 rounded" placeholder="SAU totale (ha)" />
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="production_maraichage" checked={formData.production_maraichage} onChange={handleChange} />
                <span>Maréchage</span>
              </label>
              <input name="surface_maraichage" value={formData.surface_maraichage} onChange={handleChange} className="border p-2 rounded" placeholder="Surface maréchage (ha)" />
              <input
                name="surface_plantes_parfum_medicinales"
                value={formData.surface_plantes_parfum_medicinales}
                onChange={handleChange}
                className="border p-2 rounded"
                placeholder="Surface plantes à parfum et médicinales (ha)"
              />
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="production_bovins" checked={formData.production_bovins} onChange={handleChange} />
                <span>Bovins</span>
              </label>
              <input name="bovins_nombre" value={formData.bovins_nombre} onChange={handleChange} className="border p-2 rounded" placeholder="Nombre bovins" />
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="production_volailles" checked={formData.production_volailles} onChange={handleChange} />
                <span>Volailles</span>
              </label>
              <input name="volailles_effectif" value={formData.volailles_effectif} onChange={handleChange} className="border p-2 rounded" placeholder="Effectif volailles" />
              <input name="autres_production" value={formData.autres_production} onChange={handleChange} className="border p-2 rounded md:col-span-2" placeholder="Autres productions" />
              <input name="besoin_actuel" value={formData.besoin_actuel} onChange={handleChange} className="border p-2 rounded" placeholder="Besoin stockage actuel (m3)" />
              <input name="besoin_prospectif" value={formData.besoin_prospectif} onChange={handleChange} className="border p-2 rounded" placeholder="Besoin stockage prospectif (m3)" />
              <input name="capacite_actuelle" value={formData.capacite_actuelle} onChange={handleChange} className="border p-2 rounded" placeholder="Capacité actuelle (m3)" />
              <textarea name="detail_stockage" value={formData.detail_stockage} onChange={handleChange} className="border p-2 rounded md:col-span-2" placeholder="Détail du stockage actuel" />
              <input name="capacite_besoins_actuels" value={formData.capacite_besoins_actuels} onChange={handleChange} className="border p-2 rounded" placeholder="Capacité nécessaire (actuels)" />
              <input name="capacite_besoins_prospectifs" value={formData.capacite_besoins_prospectifs} onChange={handleChange} className="border p-2 rounded" placeholder="Capacité nécessaire (moyen terme)" />
              <input name="volume_total_investissement" value={formData.volume_total_investissement} onChange={handleChange} className="border p-2 rounded" placeholder="Volume stockage total invest. (m3)" />
              <input name="micro_surface" value={formData.micro_surface} onChange={handleChange} className="border p-2 rounded" placeholder="Micro-bassine surface (m2)" />
              <input name="micro_volume" value={formData.micro_volume} onChange={handleChange} className="border p-2 rounded" placeholder="Micro-bassine volume (m3)" />
              <input name="cuve_nombre" value={formData.cuve_nombre} onChange={handleChange} className="border p-2 rounded" placeholder="Cuve nombre" />
              <input name="cuve_vol_unitaire" value={formData.cuve_vol_unitaire} onChange={handleChange} className="border p-2 rounded" placeholder="Cuve volume unitaire (m3)" />
              <input name="cuve_vol_total" value={formData.cuve_vol_total} onChange={handleChange} className="border p-2 rounded" placeholder="Cuve volume total (m3)" />
              <input name="citerne_nombre" value={formData.citerne_nombre} onChange={handleChange} className="border p-2 rounded" placeholder="Citerne souple nombre" />
              <input name="citerne_vol_unitaire" value={formData.citerne_vol_unitaire} onChange={handleChange} className="border p-2 rounded" placeholder="Citerne vol. unitaire (m3)" />
              <input name="citerne_vol_total" value={formData.citerne_vol_total} onChange={handleChange} className="border p-2 rounded" placeholder="Citerne vol. total (m3)" />
              <input name="water_tank_volume" value={formData.water_tank_volume} onChange={handleChange} className="border p-2 rounded" placeholder="Water-tank volume (m3)" />
              <input name="volume_stockage_actuel" value={formData.volume_stockage_actuel} onChange={handleChange} className="border p-2 rounded" placeholder="Volume stockage actuel" />
              <input name="volume_stockage_total_post" value={formData.volume_stockage_total_post} onChange={handleChange} className="border p-2 rounded" placeholder="Volume stockage total après" />
              <input name="surface_impluvium" value={formData.surface_impluvium} onChange={handleChange} className="border p-2 rounded" placeholder="Surface d'impluvium (m2)" />
              <input name="cout_total_projet" value={formData.cout_total_projet} onChange={handleChange} className="border p-2 rounded" placeholder="Coût total du projet" />
              <input name="depense_nature" value={formData.depense_nature} onChange={handleChange} className="border p-2 rounded" placeholder="Nature dépense" />
              <input name="depense_cout" value={formData.depense_cout} onChange={handleChange} className="border p-2 rounded" placeholder="Coût dépense" />
              <input name="depense_terrassement" value={formData.depense_terrassement} onChange={handleChange} className="border p-2 rounded" placeholder="Terrassement coût" />
              <input name="depense_pose" value={formData.depense_pose} onChange={handleChange} className="border p-2 rounded" placeholder="Pose coût" />
              <input name="depense_raccordement" value={formData.depense_raccordement} onChange={handleChange} className="border p-2 rounded" placeholder="Raccordement coût" />
              <input name="depense_pompage" value={formData.depense_pompage} onChange={handleChange} className="border p-2 rounded" placeholder="Pompage coût" />
              <textarea
                name="commentaire_projet"
                value={formData.commentaire_projet}
                onChange={handleChange}
                className="border p-2 rounded md:col-span-2"
                placeholder="Décrivez votre projet avec le plus de détails possible, notamment l’impact de la demande d’équipement sur votre exploitation et sur votre production. Soyez le plus précis possible"
              />
            </div>
          </div>

          <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Partie 3 : Télécharger</h2>
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
            <h2 className="text-xl font-bold mb-4">Partie 4 : Attestation</h2>
            <div className="space-y-2">
              <div>
                <label className="block mb-1">Je soussigné(e) (nom et prénom) :</label>
                <input className="border p-2 rounded w-full" type="text" required />
              </div>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">Certifie avoir pouvoir pour représenter le demandeur dans le cadre de la présente formalité ;</span>
              </label>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">Certifie l'ensemble des informations fournies dans le présent formulaire et les pièces jointes.</span>
              </label>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">Je suis informé qu'en cas d'irrégularité ou de non-respect de mes engagements, le remboursement des sommes perçues sera exigé, majoré d'intérêts de retard et éventuellement de pénalités financières, sans exclure d'autres poursuites et sanctions prévues par les textes en vigueur.</span>
              </label>
              <p className="font-semibold mt-2">Je déclare :</p>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">ne pas disposer de forage sur mon exploitation et ne pas avoir engagé de démarche pour en disposer.</span>
              </label>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">que mon projet ne nécessite ni permis de construire ni autorisation environnementale « Loi sur l’eau ».</span>
              </label>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">Je demande à bénéficier de l’aide aux investissements visant à renforcer la résistance à la sécheresse des exploitations agricoles mahoraises via l’acquisition d’équipements de récupération et de stockage des eaux pluviales à usage agricole.</span>
              </label>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">Je m’engage à ce que mon projet soit réalisé au plus tard le 30 juillet 2025 (mise en œuvre opérationnelle avec raccordement aux impluviums).</span>
              </label>
              <p className="font-semibold mt-2">Je m'engage, sous réserve d'attribution de l'aide :</p>
              <label className="flex items-start space-x-2">
                <input type="checkbox" required />
                <span className="flex-1">À délivrer tout document ou justificatif demandé par le bailleur pendant 3 années ;</span>
              </label>
              <p className="font-semibold mt-2">Protection des données personnelles :</p>
              <label className="flex items-start space-x-2">
                <input type="checkbox" name="attestation" checked={formData.attestation} onChange={handleChange} required />
                <span className="flex-1">J’autorise les organismes tiers (Direction des finances publiques, MSA, DAAF, fournisseurs des équipements financés par l’appel à projet.) à transmettre à GBH ou son partenaire de mise en œuvre Super Novae les données utiles à l’instruction et au paiement de la présente demande d’aide.</span>
              </label>
              <div className="mt-2 space-y-2">
                <div>
                  Fait le <input type="text" className="border p-2 rounded mx-2" placeholder="JJ/MM/AAAA" required /> Signature(s) (de tous les associés si GAEC) :
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
