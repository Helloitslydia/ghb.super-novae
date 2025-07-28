import React, { useState, useEffect } from 'react';
import { X, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface DocumentItem {
  id: string;
  doc_key: string;
  file_path: string;
}

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any | null;
  /**
   * When true, the modal is rendered in a simplified mode used on the
   * `/admin-gbh` page. Fields are read only and only the "Validé" and
   * "Refusé" buttons are displayed.
   */
  simple?: boolean;
}

export function ApplicationDetailsModal({ isOpen, onClose, application, simple = false }: ApplicationDetailsModalProps) {
  if (!isOpen || !application) return null;

  const { documents = [], ...appData } = application as any;
  const [editableData, setEditableData] = useState<Record<string, any>>({});
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonText, setReasonText] = useState('');
  const [pendingStatus, setPendingStatus] = useState<string>('');

  useEffect(() => {
    setEditableData(appData);
  }, [appData]);

  const handleChange = (key: string, value: string) => {
    setEditableData(prev => ({ ...prev, [key]: value }));
  };

  const toggleField = (key: string) => {
    setEditingFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openReasonModal = (status: string) => {
    setPendingStatus(status);
    setReasonText('');
    setReasonModalOpen(true);
  };

  const saveChanges = async () => {
    await supabase
      .from('project_applications')
      .update(editableData)
      .eq('id', application.id);
    toast.success('Données mises à jour');
  };

  const updateStatus = async (status: string) => {
    await supabase
      .from('project_applications')
      .update({ status })
      .eq('id', application.id);
    setEditableData(prev => ({ ...prev, status }));
    toast.success(`Statut mis à jour: ${status}`);
  };

  const confirmReason = async () => {
    if (!pendingStatus) return;
    const updateData: Record<string, any> = { status: pendingStatus };
    if (pendingStatus === 'Elements manquants') {
      updateData.missing_elements_reason = reasonText;
    }
    if (pendingStatus === 'Refusé') {
      updateData.refusal_reason = reasonText;
    }
    await supabase
      .from('project_applications')
      .update(updateData)
      .eq('id', application.id);
    setEditableData(prev => ({ ...prev, ...updateData }));
    toast.success(`Statut mis à jour: ${pendingStatus}`);
    setReasonModalOpen(false);
  };

  const handleMissingElementsClick = () => {
    fetch('https://hooks.ksaar.co/1d9f1415-1c7c-4734-8e62-66a45e7cb900', { method: 'POST' }).catch(
      (err) => console.error('Webhook error', err)
    );
    openReasonModal('Elements manquants');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-h-[90vh] overflow-auto w-[90vw] max-w-3xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Détails de la candidature</h2>
        <div className="overflow-x-auto text-sm">
          <table className="min-w-full">
            <tbody>
              {Object.entries(editableData).map(([key, value]) => (
                <tr key={key} className="border-b last:border-b-0">
                  <td className="py-1 pr-2 font-medium capitalize break-words">
                    {key.replace(/_/g, ' ')}
                  </td>
                  <td className="py-1 break-words">
                    {simple ? (
                      <span className="break-words">{String(value ?? '')}</span>
                    ) : editingFields[key] ? (
                      <input
                        className="border p-1 rounded w-full"
                        value={value as string}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center">
                        <span className="flex-1 break-words">{String(value ?? '')}</span>
                        <button
                          onClick={() => toggleField(key)}
                          className="ml-2 text-gray-500 hover:text-blue-600"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {documents.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Pièces jointes</h3>
            <ul className="space-y-1 text-sm">
              {documents.map((doc: DocumentItem) => {
                const bucket = doc.doc_key === 'signature' ? 'signatures' : 'documents';
                const { data } = supabase.storage.from(bucket).getPublicUrl(doc.file_path);
                const url = data.publicUrl;
                return (
                  <li key={doc.id}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-all"
                    >
                      {doc.doc_key}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div className="mt-4">
          <label className="font-semibold mb-1 block">Commentaire</label>
          <textarea
            className="border p-2 rounded w-full"
            value={editableData.commentaire ?? ''}
            onChange={(e) => handleChange('commentaire', e.target.value)}
            rows={4}
          />
        </div>
        <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap gap-2">
          {!simple && (
            <button
              onClick={saveChanges}
              className="bg-[#2D6A4F] text-white px-4 py-2 rounded w-full sm:w-auto"
            >
              Enregistrer
            </button>
          )}
          <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded w-full sm:w-auto">
            Fermer
          </button>
          {simple ? (
            <>
              <button
                onClick={() => updateStatus('Validé')}
                className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Validé
              </button>
              <button
                onClick={() => openReasonModal('Refusé')}
                className="bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Refusé
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => updateStatus('Dossier conforme')}
                className="bg-green-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Dossier conforme
              </button>
              <button
                onClick={handleMissingElementsClick}
                className="bg-yellow-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Dossier à modifier - Elements manquants
              </button>
              <button
                onClick={() => openReasonModal('Refusé')}
                className="bg-red-600 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Dossier refusé
              </button>
            </>
          )}
        </div>
        {reasonModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow w-96">
              <h3 className="text-lg font-semibold mb-2">Motif</h3>
              <textarea
                className="border p-2 rounded w-full mb-4"
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setReasonModalOpen(false)}
                  className="px-4 py-2 border rounded"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmReason}
                  className="px-4 py-2 bg-[#2D6A4F] text-white rounded"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
