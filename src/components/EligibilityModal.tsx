import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EligibilityModal({ isOpen, onClose }: EligibilityModalProps) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold text-center mb-4">Critères d'éligibilité</h2>
        <p className="text-gray-700 mb-4 text-center">
          Pour bénéficier d'une subvention, vous devez&nbsp;:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Être agriculteur ou exploitant à Mayotte</li>
        </ul>

        <button
          onClick={() => {
            onClose();
            navigate('/signup');
          }}
          className="mt-6 w-full bg-[#2D6A4F] text-white py-2 px-4 rounded-md hover:bg-[#1B4332] transition-colors"
        >
          Créer un compte
        </button>
      </div>
    </div>
  );
}
