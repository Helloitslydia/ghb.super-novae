import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
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
}

export function ApplicationDetailsModal({ isOpen, onClose, application }: ApplicationDetailsModalProps) {
  if (!isOpen || !application) return null;

  const { documents = [], ...appData } = application as any;
  const [editableData, setEditableData] = useState<Record<string, any>>({});

  useEffect(() => {
    setEditableData(appData);
  }, [appData]);

  const handleChange = (key: string, value: string) => {
    setEditableData(prev => ({ ...prev, [key]: value }));
  };

  const saveChanges = async () => {
    await supabase
      .from('project_applications')
      .update(editableData)
      .eq('id', application.id);
    toast.success('Données mises à jour');
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
                    <input
                      className="border p-1 rounded w-full"
                      value={value as string}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
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
        <div className="mt-4 flex space-x-2">
          <button
            onClick={saveChanges}
            className="bg-[#2D6A4F] text-white px-4 py-2 rounded"
          >
            Enregistrer
          </button>
          <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
