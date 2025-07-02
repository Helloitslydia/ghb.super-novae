import React, { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DocumentItem {
  key: string;
  label: string;
}

const documents: DocumentItem[] = [
  { key: 'identity', label: "Pièce d'identité du représentant légal" },
  { key: 'domiciliation', label: 'Justificatif de domiciliation' },
  { key: 'rib', label: 'RIB professionnel' },
  { key: 'kbis', label: 'Extrait Kbis (si société agricole)' },
  { key: 'msa', label: 'Attestation d’affiliation MSA' },
  { key: 'fiscal', label: 'Attestation de régularité fiscale' },
  { key: 'plan', label: "Plan ou schéma de l'exploitation" },
  { key: 'foncier', label: 'Justificatifs de foncier' },
  { key: 'pac', label: 'Dernier relevé PAC' },
  { key: 'productions', label: 'Présentation des productions' },
  { key: 'bilans', label: 'Bilans ou comptes de résultats' },
  { key: 'financement', label: 'Plan de financement prévisionnel' },
  { key: 'devis', label: 'Devis ou estimations des dépenses prévues' },
  { key: 'note', label: 'Note de présentation du projet' },
  { key: 'cofinancement', label: 'Attestation(s) de cofinancement éventuel' },
  { key: 'nonrecours', label: 'Attestation de non-recours à des financements incompatibles' },
];

function DocumentUpload() {
  const { user } = useAuth();
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      for (const doc of documents) {
        const file = files[doc.key];
        if (file) {
          const filePath = `${user.id}/${doc.key}-${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);
          if (uploadError) throw uploadError;

          const { error: insertError } = await supabase
            .from('user_documents')
            .insert({ user_id: user.id, doc_key: doc.key, file_path: filePath });
          if (insertError) throw insertError;
        }
      }
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, fileList: FileList | null) => {
    setFiles((prev) => ({ ...prev, [key]: fileList ? fileList[0] : null }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      for (const doc of documents) {
        const file = files[doc.key];
        if (file) {
          const filePath = `${user.id}/${doc.key}-${Date.now()}-${file.name}`;
          const { error } = await supabase.storage.from('documents').upload(filePath, file);
          if (error) throw error;
        }
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du dépôt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2D6A4F] to-[#1B4332] py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-[#2D6A4F]">Déposez vos documents</h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {documents.map((doc) => (
            <div key={doc.key} className="flex flex-col">
              <label className="font-medium mb-1" htmlFor={doc.key}>
                {doc.label}
              </label>
              <input
                id={doc.key}
                type="file"
                onChange={(e) => handleChange(doc.key, e.target.files)}
                className="border border-gray-300 rounded p-2"
              />
            </div>
          ))}
          {error && <p className="text-red-600">{error}</p>}
          {success && (
            <p className="text-green-600">Documents déposés avec succès</p>
          )}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-4 py-2 bg-[#2D6A4F] text-white rounded hover:bg-[#1B4332] disabled:opacity-50"
            >
              {loading ? 'Envoi en cours...' : 'Déposer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default DocumentUpload;

