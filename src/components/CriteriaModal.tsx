import React from 'react';
import { X } from 'lucide-react';

interface CriteriaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CriteriaModal({ isOpen, onClose }: CriteriaModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-center mb-4">Critères</h2>
        <div className="space-y-4 text-gray-700 text-sm md:text-base">
          <h3 className="font-semibold">1. Projets éligibles et dépenses éligibles</h3>
          <p>Pour être éligibles, les projets doivent concerner des investissements visant à renforcer la résilience à la sécheresse des exploitations agricoles mahoraises via l’acquisition d’équipements de récupération et de stockage des eaux pluviales à usage agricole.</p>
          <p>L’effet attendu est de préserver les capacités de production de ces exploitations en saison sèche sans impact sur le niveau des eaux de surface ou des nappes.</p>
          <p>Ne sont pas éligibles :</p>
          <ul className="list-disc list-inside ml-4">
            <li>les constructions de bâtiments ;</li>
            <li>les investissements nécessitant un permis de construire ou une autorisation environnementale « Loi sur l’eau ».</li>
          </ul>
          <p>Sont éligibles les investissements de stockage d’eau suivants (si exemptés d’autorisation administrative) :</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Micro-bassines ou réservoirs creusés dans le sol (surface inférieure à 1000 m²) ;</li>
            <li>Cuves en plastique opaque ;</li>
            <li>Cuves métalliques en acier galvanisé avec pied ;</li>
            <li>Citernes souples ;</li>
            <li>Réservoir de type « water-tank ».</li>
          </ul>
          <p>Les projets doivent présenter des éléments probants sur la capacité de remplissage des stockages : surface d’impluvium à hauteur de 1 m²/m³ de capacité de stockage.</p>
          <p>Les dépenses annexes comme la pose, le terrassement, l’installation de gouttières et tuyaux de raccordement, la main-d’œuvre ou le matériel de pompage sont également éligibles.</p>
          <p>Aucune dépense engagée avant l’ouverture de l’appel à projets n’est éligible.</p>

          <h3 className="font-semibold mt-6">2. Porteurs éligibles</h3>
          <p>Sont éligibles les agriculteurs :</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>installés à titre individuel ou en société immatriculée au RCS avec un SIRET agricole dont au moins 50&nbsp;% du capital est détenu par des exploitants agricoles ;</li>
            <li>et affiliés à la MSA à titre principal ou secondaire au 31/03/2025.</li>
          </ul>
          <p>Sont inéligibles :</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>les porteurs disposant déjà d’un forage ;</li>
            <li>les éleveurs bovins sans numéro EDE, avec animaux non identifiés ou sans vétérinaire sanitaire ;</li>
            <li>les éleveurs de volaille non déclarés auprès du service Alimentation de la DAAF.</li>
          </ul>

          <h3 className="font-semibold mt-6">3. Modalités de sélection des projets</h3>
          <p>Un seul dossier sera accepté par exploitation. Les producteurs uniquement vivrier ne sont pas prioritaires.</p>
          <p>Sont prioritaires les projets d’agriculteurs :</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>exerçant une activité de production maraîchère ou d’élevage bovins ou volailles ;</li>
            <li>ne disposant pas d’installation de récupération et de stockage d’eau pluviale correspondant à leurs besoins actuels.</li>
          </ul>
          <p>La qualité de la description technique du projet et de son adéquation avec le besoin constitue un élément primordial de classement.</p>
          <p>GBH et Super Novae effectuent la sélection des projets avec l’avis d’un comité dédié.</p>

          <h3 className="font-semibold mt-6">4. Modalités de financements</h3>
          <p>Le montant maximum de l’aide est fixé à 20 000 € par projet sélectionné. Le comité de sélection peut couvrir un montant supérieur sous réserve de motivation et de fonds suffisants.</p>

          <h3 className="font-semibold mt-6">5. Modalités de candidature</h3>
          <p>La date d’ouverture est indiquée en page d’accueil. Les projets sont déposés en ligne et la clôture est indiquée sur le site.</p>
          <p>Seuls les dossiers complets sont instruits. Les bénéficiaires seront notifiés sous deux semaines ouvrées après la clôture de l’appel à projets.</p>
          <p>Le projet doit être réalisé au plus tard le 30 octobre 2025. La demande de paiement et les factures doivent être reçues au plus tard le 15 septembre 2025.</p>
          <p>Chaque porteur dépose une demande en ligne et fournit notamment&nbsp;: pièce d’identité, SIRET, KBIS le cas échéant, RIB, description technique du projet, devis des fournisseurs attestant de la possibilité de livraison et/ou d’installation dans la période prévue.</p>
        </div>
      </div>
    </div>
  );
}
