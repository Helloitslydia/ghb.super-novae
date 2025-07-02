import React, { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ArrowLeft,
  Download,
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
  description?: string;
}

const documents: DocumentItem[] = [
  { 
    key: 'identity', 
    label: "Pièce d'identité du représentant légal", 
    required: true,
    description: "Carte d'identité, passeport ou permis de conduire en cours de validité"
  },
  { 
    key: 'domiciliation', 
    label: 'Justificatif de domiciliation', 
    required: true,
    description: "Facture d'électricité, de téléphone ou attestation de domicile récente"
  },
  { 
    key: 'rib', 
    label: 'RIB professionnel', 
    required: true,
    description: "Relevé d'identité bancaire de votre compte professionnel"
  },
  { 
    key: 'kbis', 
    label: 'Extrait Kbis (si société agricole)', 
    required: false,
    description: "Document de moins de 3 mois pour les sociétés"
  },
  { 
    key: 'msa', 
    label: 'Attestation d\'affiliation MSA', 
    required: true,
    description: "Attestation récente de votre affiliation à la MSA"
  },
  { 
    key: 'fiscal', 
    label: 'Attestation de régularité fiscale', 
    required: true,
    description: "Document délivré par les services fiscaux"
  },
  { 
    key: 'plan', 
    label: "Plan ou schéma de l'exploitation", 
    required: true,
    description: "Plan détaillé de votre exploitation agricole"
  },
  { 
    key: 'foncier', 
    label: 'Justificatifs de foncier', 
    required: true,
    description: "Titre de propriété, bail rural ou convention d'occupation"
  },
  { 
    key: 'pac', 
    label: 'Dernier relevé PAC', 
    required: false,
    description: "Relevé de la Politique Agricole Commune si applicable"
  },
  { 
    key: 'productions', 
    label: 'Présentation des productions', 
    required: true,
    description: "Document détaillant vos productions agricoles actuelles"
  },
  { 
    key: 'bilans', 
    label: 'Bilans ou comptes de résultats', 
    required: true,
    description: "Documents comptables des 2 dernières années"
  },
  { 
    key: 'financement', 
    label: 'Plan de financement prévisionnel', 
    required: true,
    description: "Plan détaillé du financement de votre projet"
  },
  { 
    key: 'devis', 
    label: 'Devis ou estimations des dépenses prévues', 
    required: true,
    description: "Devis détaillés pour les équipements et travaux"
  },
  { 
    key: 'note', 
    label: 'Note de présentation du projet', 
    required: true,
    description: "Description complète de votre projet et de ses objectifs"
  },
  { 
    key: 'cofinancement', 
    label: 'Attestation(s) de cofinancement éventuel', 
    required: false,
    description: "Si vous bénéficiez d'autres financements"
  },
  { 
    key: 'nonrecours', 
    label: 'Attestation de non-recours à des financements incompatibles', 
    required: true,
    description: "Attestation sur l'honneur de non-cumul de financements"
  },
];

interface UploadedFile {
  file: File;
  preview?: string;
}

function DocumentUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<Record<string, UploadedFile>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [completionRate, setCompletionRate] = useState(0);

  useEffect(() => {
    // Calculer le taux de completion
    const requiredDocs = documents.filter(doc => doc.required);
    const uploadedRequired = requiredDocs.filter(doc => files[doc.key]);
    const rate = (uploadedRequired.length / requiredDocs.length) * 100;
    setCompletionRate(rate);
  }, [files]);

  const handleFileSelect = (key: string, selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles[0]) {
      const file = selectedFiles[0];
      
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux (max 10MB)');
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non autorisé. Utilisez PDF, JPG ou PNG.');
        return;
      }

      const uploadedFile: UploadedFile = { file };
      
      // Créer un aperçu pour les images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
          setFiles(prev => ({ ...prev, [key]: uploadedFile }));
        };
        reader.readAsDataURL(file);
      } else {
        setFiles(prev => ({ ...prev, [key]: uploadedFile }));
      }

      toast.success('Fichier ajouté avec succès');
    }
  };

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOver(null);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(key, droppedFiles);
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOver(key);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const removeFile = (key: string) => {
    setFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[key];
      return newFiles;
    });
    toast.success('Fichier supprimé');
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      for (const doc of documents) {
        const uploadedFile = files[doc.key];
        if (uploadedFile) {
          const filePath = `${user.id}/${Date.now()}-${uploadedFile.file.name}`;
          const { error: uploadError } = await supabase.storage
            .from(doc.key)
            .upload(filePath, uploadedFile.file);
          
          if (uploadError) {
            console.warn(`Upload failed for ${doc.key}:`, uploadError);
          } else {
            const { error: insertError } = await supabase
              .from('user_documents')
              .insert({ user_id: user.id, doc_key: doc.key, file_path: filePath });
            
            if (insertError) {
              console.warn(`Database insert failed for ${doc.key}:`, insertError);
            }
          }
        }
      }
      toast.success('Documents sauvegardés avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Vérifier que tous les documents requis sont présents
    const missingRequired = documents
      .filter(doc => doc.required && !files[doc.key])
      .map(doc => doc.label);

    if (missingRequired.length > 0) {
      toast.error(`Documents requis manquants: ${missingRequired.join(', ')}`);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Sauvegarder d'abord
      await handleSave();
      
      setSuccess(true);
      toast.success('Dossier déposé avec succès ! Vous recevrez une confirmation par email.');
      
      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du dépôt';
      setError(errorMessage);
      toast.error(errorMessage);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dépôt de documents</h1>
                <p className="text-gray-600">Téléversez vos pièces justificatives</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Progression</div>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(completionRate)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Instructions importantes</h3>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• Les documents marqués d'un astérisque (*) sont obligatoires</li>
                <li>• Formats acceptés : PDF, JPG, PNG (max 10MB par fichier)</li>
                <li>• Assurez-vous que vos documents sont lisibles et récents</li>
                <li>• Vous pouvez sauvegarder votre progression et revenir plus tard</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Documents Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {documents.map((doc) => {
              const uploadedFile = files[doc.key];
              const isUploaded = !!uploadedFile;
              
              return (
                <div 
                  key={doc.key} 
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        {doc.label}
                        {doc.required && <span className="text-red-500 ml-1">*</span>}
                        {isUploaded && <CheckCircle className="w-4 h-4 text-green-500 ml-2" />}
                      </h3>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                      )}
                    </div>
                  </div>

                  {!isUploaded ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragOver === doc.key
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDrop={(e) => handleDrop(e, doc.key)}
                      onDragOver={(e) => handleDragOver(e, doc.key)}
                      onDragLeave={handleDragLeave}
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Glissez-déposez votre fichier ici ou
                      </p>
                      <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        Choisir un fichier
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileSelect(doc.key, e.target.files)}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getFileIcon(uploadedFile.file)}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {uploadedFile.file.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {formatFileSize(uploadedFile.file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {uploadedFile.preview && (
                            <button
                              type="button"
                              onClick={() => window.open(uploadedFile.preview, '_blank')}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Aperçu"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(doc.key)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Supprimer"
                          >
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

          {/* Messages d'état */}
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
                <p className="text-green-800">
                  Dossier déposé avec succès ! Redirection en cours...
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || Object.keys(files).length === 0}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder le brouillon'}
              </button>
              
              <button
                type="submit"
                disabled={loading || completionRate < 100}
                className="flex items-center justify-center px-8 py-3 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#1B4332] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Send className="w-5 h-5 mr-2" />
                {loading ? 'Dépôt en cours...' : 'Déposer le dossier'}
              </button>
            </div>
            
            {completionRate < 100 && (
              <p className="text-sm text-gray-600 mt-3 text-center">
                Veuillez téléverser tous les documents requis avant de déposer votre dossier
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default DocumentUpload;