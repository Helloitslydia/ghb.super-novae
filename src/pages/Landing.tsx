import React from 'react';

import { ClipboardCheck, Download, MessageSquareText, ArrowRight, Menu, X } from 'lucide-react';
import { LoginModal } from '../components/LoginModal';
import { EligibilityModal } from '../components/EligibilityModal';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    icon: <ClipboardCheck className="w-6 h-6" />,
    title: "1) Vérifiez si votre projet est éligible",
    description:
      "Prenez 2 minutes pour découvrir les critères et préparez votre candidature avant le [date limite]."
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: "2) Téléversez vos documents en toute simplicité",
    description: "Déposez vos pièces en ligne, la plateforme vous guide à chaque étape."
  },
  {
    icon: <MessageSquareText className="w-6 h-6" />,
    title: "3) Suivez l’avancement de votre dossier en temps réel",
    description: "Accédez facilement aux informations dont vous avez besoin, à tout moment."
  }
];

const programInfo = {
  title: "Pourquoi ce programme ?",
  description: "Notre entreprise s'engage aux côtés des agriculteurs de Mayotte en mettant à disposition des financements pour des projets de récupération et de gestion durable de l'eau.",
  benefits: [
    "Réduire la vulnérabilité des exploitations agricoles au stress hydrique",
    "Encourager des pratiques agricoles durables",
    "Créer un impact environnemental et économique positif à l'échelle locale"
  ]
};

function Landing() {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = React.useState(false);
  const { user } = useAuth();
  const videoUrl = "//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1746742604286x870259835249476100/20250509_0009_Modern%20Farmland%20Harmony_remix_01jtrz3hf8e9krdsy57armr27d.mp4";

  return (
    <div className="min-h-screen relative overflow-hidden">
      <video
        autoPlay
        muted
        loop
        preload="auto"
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 min-h-screen"
        style={{ filter: 'brightness(0.7)' }}
        onEnded={(e) => {
          const video = e.target as HTMLVideoElement;
          video.play().catch(console.error);
        }}
      >
        <source src={videoUrl} type="video/mp4" />
      </video>
      
      <div className="relative z-10 min-h-screen bg-black bg-opacity-50 flex flex-col">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <EligibilityModal isOpen={isEligibilityModalOpen} onClose={() => setIsEligibilityModalOpen(false)} />
      <nav className="container mx-auto px-6 py-4 relative">
        <div className="relative">
          <div className="flex justify-between items-center">
            <Link to="/admin" className="flex items-center space-x-2">
              <img
                src="//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1746787922004x941654894198586100/Capture%20d%E2%80%99e%CC%81cran%202025-05-09%20a%CC%80%2012.51.44.png"
                alt="Logo GBH"
                className="h-8 w-auto mr-2"
              />
              <span className="text-xl font-bold text-white">by GBH</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <Link
                  to="/documentupload"
                  className="px-4 py-2 text-white hover:text-gray-200 rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 text-white hover:text-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Connexion
                </button>
              )}
              {!user && (
                <button
                  onClick={() => setIsEligibilityModalOpen(true)}
                  className="bg-[#2D6A4F] text-white px-4 py-2 rounded-lg hover:bg-[#1B4332] transition-colors shadow-lg"
                >
                  Déposer votre dossier
                </button>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-gray-200"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-black bg-opacity-90 mt-2 py-4 rounded-lg md:hidden">
              <div className="flex flex-col space-y-3 px-4">
                {user ? (
                  <Link
                    to="/documentupload"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:text-gray-200 py-2 text-center"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-white hover:text-gray-200 py-2 text-center"
                  >
                    Connexion
                  </button>
                )}
                {!user && (
                  <button
                    onClick={() => {
                      setIsEligibilityModalOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-[#2D6A4F] text-white py-2 rounded-lg hover:bg-[#1B4332] transition-colors shadow-lg text-center"
                  >
                    Déposer votre dossier
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-20 pb-8">
      <div className="max-w-full md:ml-0">
  <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
    <strong>Appel à projets pour renforcer l'agriculture à Mayotte</strong>
  </h1>
  <p className="text-xl text-white mb-6 md:max-w-xl space-y-3">
    <span className="block">Vous êtes agriculteur, ou exploitant à Mayotte ?</span>
    <span className="block">Vous souhaitez vous équiper de bassines de récupération d'eau de pluie pour renforcer la résilience de votre activité face au changement climatique ?</span>
  </p>
  <div className="flex justify-start space-x-4 mt-16">
            {!user && (
              <button
                onClick={() => setIsEligibilityModalOpen(true)}
                className="flex items-center bg-[#2D6A4F] text-white px-8 py-4 rounded-lg hover:bg-[#1B4332] transition-colors shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Déposer votre dossier maintenant
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            )}
         </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white mb-6">Les étapes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white border-opacity-20">
                <div className="text-[#2D6A4F] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 border border-white border-opacity-20">
            <h2 className="text-3xl font-bold text-white mb-6">{programInfo.title}</h2>
            <p className="text-xl text-gray-200 mb-8">
              {programInfo.description}
            </p>
            <p className="text-xl text-gray-200 mb-4">Il vise à :</p>
            <div className="space-y-4">
              {programInfo.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-[#2D6A4F]">—</span>
                  <p className="text-lg text-gray-200">{benefit}</p>
                </div>
              ))}
            </div>
            <p className="text-xl text-gray-200 mt-8">
              Pour consulter l'ensemble de nos engagements et de nos actions, <a href="https://gbh.fr/fr/nos-engagements" className="text-[#2D6A4F] hover:text-[#1B4332] underline" target="_blank" rel="noopener noreferrer">cliquez ici</a>.
            </p>
          </div>
        </div>

      </main>
      
      <footer className="mt-auto bg-black bg-opacity-50 border-t border-white border-opacity-20">
        <div className="container mx-auto px-6 py-3">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <span className="text-sm text-gray-400 md:text-base text-center w-full md:w-auto">© 2025 - GBH et Super-Novae NGO</span>
            <span className="hidden md:block text-sm text-gray-400">Tous droits réservés</span>
          </div>
          <div className="py-1"></div>
        </div>
      </footer>
      </div>
    </div>
  );
}

export default Landing;