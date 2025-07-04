import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  sau_totale: string;
  production_maraichage: boolean;
  surface_maraichage: string;
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
  status: string;
  attestation: boolean;
}

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
  sau_totale: '',
  production_maraichage: false,
  surface_maraichage: '',
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
  status: 'Brouillon',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const saveFormData = async () => {
    if (!user) return;
    const { error: upsertError } = await supabase
      .from('project_applications')
      .upsert({ user_id: user.id, ...formData }, { onConflict: 'user_id' });
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveFormData();
      await saveFiles();
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
    const missingRequired = documents.filter(d => d.required && !files[d.key]);
    if (missingRequired.length > 0) {
      toast.error('Veuillez t\xE9l\xE9verser tous les documents requis');
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
      setTimeout(() => navigate('/dashboard'), 2000);
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
                <h1 className="text-2xl font-bold text-gray-900">D\xE9p\xF4t de dossier</h1>
                <p className="text-gray-600">Compl\xE9tez les informations et t\xE9l\xE9versez vos fichiers</p>
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
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Partie 1 : Votre exploitation</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input name="siret" value={formData.siret} onChange={handleChange} className="border p-2 rounded" placeholder="N° SIRET" required />
              <input name="pacage" value={formData.pacage} onChange={handleChange} className="border p-2 rounded" placeholder="N° PACAGE" />
              <input name="ede" value={formData.ede} onChange={handleChange} className="border p-2 rounded" placeholder="N° EDE" />
              <input name="inuav1" value={formData.inuav1} onChange={handleChange} className="border p-2 rounded" placeholder="N° INUAV 1" />
              <input name="inuav2" value={formData.inuav2} onChange={handleChange} className="border p-2 rounded" placeholder="N° INUAV 2" />
              <input name="inuav3" value={formData.inuav3} onChange={handleChange} className="border p-2 rounded" placeholder="N° INUAV 3" />
              <input name="nom" value={formData.nom} onChange={handleChange} className="border p-2 rounded" placeholder="Nom / raison sociale" />
              <input name="statut" value={formData.statut} onChange={handleChange} className="border p-2 rounded" placeholder="Statut juridique" />
              <textarea name="adresse" value={formData.adresse} onChange={handleChange} className="border p-2 rounded md:col-span-2" placeholder="Adresse" />
              <input name="code_postal" value={formData.code_postal} onChange={handleChange} className="border p-2 rounded" placeholder="Code postal" />
              <input name="commune" value={formData.commune} onChange={handleChange} className="border p-2 rounded" placeholder="Commune" />
              <input name="tel_fixe" value={formData.tel_fixe} onChange={handleChange} className="border p-2 rounded" placeholder="Téléphone fixe" />
              <input name="tel_mobile" value={formData.tel_mobile} onChange={handleChange} className="border p-2 rounded" placeholder="Téléphone mobile" />
              <input name="email" value={formData.email} onChange={handleChange} className="border p-2 rounded md:col-span-2" placeholder="Email" />
              <label className="flex items-center space-x-2 md:col-span-2">
                <input type="checkbox" name="affiliation_msa" checked={formData.affiliation_msa} onChange={handleChange} />
                <span>Affiliation MSA agriculteur au 31/03/2025</span>
              </label>
            </div>
          </div>

          <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Partie 2 : Votre projet</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input name="sau_totale" value={formData.sau_totale} onChange={handleChange} className="border p-2 rounded" placeholder="SAU totale (ha)" />
              <label className="flex items-center space-x-2">
                <input type="checkbox" name="production_maraichage" checked={formData.production_maraichage} onChange={handleChange} />
                <span>Mara\xEEchage</span>
              </label>
              <input name="surface_maraichage" value={formData.surface_maraichage} onChange={handleChange} className="border p-2 rounded" placeholder="Surface mara\xEEchage (ha)" />
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
            </div>
          </div>

          <div className="space-y-6 bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Partie 3 : Documents \xE0 t\xE9l\xE9charger</h2>
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
                        <p className="text-sm text-gray-600 mb-2">Glissez-d\xE9posez ou</p>
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
            <label className="flex items-center space-x-2">
              <input type="checkbox" name="attestation" checked={formData.attestation} onChange={handleChange} />
              <span>Je certifie l'exactitude des informations fournies</span>
            </label>
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
                <p className="text-green-800">Dossier d\xE9pos\xE9 avec succ\xE8s ! Redirection en cours...</p>
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
            {completionRate < 100 && <p className="text-sm text-gray-600 mt-3 text-center">Veuillez t\xE9l\xE9verser tous les documents requis</p>}
          </div>
        </form>
      </div>
    </div>
  );
}

export default DocumentUpload;
