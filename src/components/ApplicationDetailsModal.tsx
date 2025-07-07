import React from 'react';
import { X } from 'lucide-react';

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any | null;
}

export function ApplicationDetailsModal({ isOpen, onClose, application }: ApplicationDetailsModalProps) {
  if (!isOpen || !application) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-h-[90vh] overflow-auto w-[90vw] max-w-3xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Détails de la candidature</h2>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(application, null, 2)}</pre>
        <button onClick={onClose} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Fermer
        </button>
      </div>
    </div>
  );
}
