import React from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCriteria: () => void;
}

export function EligibilityModal({ isOpen, onClose, onOpenCriteria }: EligibilityModalProps) {
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
        <div className="text-gray-700 space-y-2 text-sm md:text-base">
          <p>Ne sont pas éligibles&nbsp;:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>les constructions de bâtiments&nbsp;;</li>
            <li>les investissements nécessitant un permis de construire ou une autorisation environnementale « Loi sur l’eau ».</li>
          </ul>
          <p>Sont éligibles les investissements de stockage d’eau suivants (si exemptés d’autorisation administrative)&nbsp;:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Micro-bassines ou réservoirs creusés dans le sol (surface inférieure à 1000 m²)&nbsp;;</li>
            <li>Cuves en plastique opaque&nbsp;;</li>
            <li>Cuves métalliques en acier galvanisé avec pied&nbsp;;</li>
            <li>Citernes souples&nbsp;;</li>
            <li>Réservoir de type « water-tank ».</li>
          </ul>
        </div>
        <button
          onClick={onOpenCriteria}
          className="mt-4 text-[#2D6A4F] hover:text-[#1B4332] underline"
        >
          En savoir plus
        </button>

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
