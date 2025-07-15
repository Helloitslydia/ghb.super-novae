import React from 'react';

import { ClipboardCheck, Download, MessageSquareText, ArrowRight, Menu, X } from 'lucide-react';
import { LoginModal } from '../components/LoginModal';
import { EligibilityModal } from '../components/EligibilityModal';
import { CriteriaModal } from '../components/CriteriaModal';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';


const programInfo = {
  title: "Pourquoi ce programme ?",
  description: "GBH et Super-Novae s'engagent ensemble aux cotés des agriculteurs mahorais, en mettant en place un fonds de soutien pour renforcer leur résilience à la sécheresse. Ce programme vise à financer l’acquisition d’équipements de récupération et de stockage des eaux pluviales à usage agricole.",
  benefits: [
    "Renforcer la résilience des exploitations agricoles face au stress hydrique",
    "Promouvoir des pratiques agricoles durables",
    "Générer un impact environnemental et économique positif à l’échelle locale"
  ]
};

function Landing() {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isEligibilityModalOpen, setIsEligibilityModalOpen] = React.useState(false);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = React.useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dashboardLink, setDashboardLink] = React.useState('/documentupload');
  const videoUrl = "//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1746742604286x870259835249476100/20250509_0009_Modern%20Farmland%20Harmony_remix_01jtrz3hf8e9krdsy57armr27d.mp4";

  const features = [
    {
      icon: <ClipboardCheck className="w-6 h-6 text-[#E8B647]" />,
      title: "Etape 1 : préparez votre candidature avant le 15/09/2025",
      description: (
        <span>
          <button
            onClick={() => setIsCriteriaModalOpen(true)}
            className="text-[#E8B647] underline"
          >
            Consultez les critères de selection
          </button>
        </span>
      )
    },
    {
      icon: <Download className="w-6 h-6 text-[#E8B647]" />,
      title: "2) Téléversez vos documents en toute simplicité",
      description: "Déposez vos pièces en ligne, la plateforme vous guide à chaque étape.",
      buttonLabel: "Déposer votre dossier",
      onClick: () => setIsEligibilityModalOpen(true)
    },
    {
      icon: <MessageSquareText className="w-6 h-6 text-[#E8B647]" />,
      title: "3) Suivez l’avancement de votre dossier en temps réel",
      description: "Accédez facilement aux informations dont vous avez besoin, à tout moment.",
      buttonLabel: "Connexion",
      onClick: () => setIsLoginModalOpen(true)
    }
  ];

  React.useEffect(() => {
    const fetchLink = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('project_applications')
        .select('status')
        .eq('user_id', user.id)
        .single();

      const allowedStatuses = [
        'Etude du dossier en cours',
        'Validé',
        'Refusé',
      ];

      if (
        !error &&
        data &&
        data.status &&
        allowedStatuses.includes(data.status)
      ) {
        setDashboardLink('/application');
      } else {
        setDashboardLink('/documentupload');
      }
    };

    fetchLink();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
      <EligibilityModal
        isOpen={isEligibilityModalOpen}
        onClose={() => setIsEligibilityModalOpen(false)}
        onOpenCriteria={() => setIsCriteriaModalOpen(true)}
      />
      <CriteriaModal isOpen={isCriteriaModalOpen} onClose={() => setIsCriteriaModalOpen(false)} />
      <nav className="container mx-auto px-6 py-4 relative">
        <div className="relative">
          <div className="flex justify-between items-center">
            <Link to="/admin" className="flex items-center space-x-2">
              <img
                src="//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1748260793529x933715376486754600/Linkedin%20Company%20Logo%20%281%29.png"
                alt="Logo GBH"
                className="h-8 w-auto"
              />
              <img
                src="//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1746787922004x941654894198586100/Capture%20d%E2%80%99e%CC%81cran%202025-05-09%20a%CC%80%2012.51.44.png"
                alt="Logo partenaire"
                className="h-8 w-auto"
              />
              <span className="text-xl font-bold text-white">By GBH x Super-Novae</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to={dashboardLink}
                    className="px-4 py-2 text-white hover:text-gray-200 rounded-lg transition-colors"
                  >
                    Tableau de bord
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-white hover:text-gray-200 rounded-lg transition-colors"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 text-white hover:text-gray-200 rounded-lg transition-colors cursor-pointer"
                >
                  Connexion
                </button>
              )}
              {!user && (
                <>
                  <button
                    onClick={() => setIsEligibilityModalOpen(true)}
                    className="bg-[#2D6A4F] text-white px-4 py-2 rounded-lg hover:bg-[#1B4332] transition-colors shadow-lg"
                  >
                    Déposer votre dossier
                  </button>
                  <button
                    onClick={() => setIsCriteriaModalOpen(true)}
                    className="ml-2 px-4 py-2 text-white hover:text-gray-200 rounded-lg transition-colors"
                  >
                    Consulter les critères
                  </button>
                </>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-gray-200"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-[#E8B647]" />
              ) : (
                <Menu className="h-6 w-6 text-[#E8B647]" />
              )}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-black bg-opacity-90 mt-2 py-4 rounded-lg md:hidden">
              <div className="flex flex-col space-y-3 px-4">
                {user ? (
                  <>
                    <Link
                      to={dashboardLink}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-white hover:text-gray-200 py-2 text-center"
                    >
                      Tableau de bord
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-white hover:text-gray-200 py-2 text-center"
                    >
                      Déconnexion
                    </button>
                  </>
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
                  <>
                    <button
                      onClick={() => {
                        setIsEligibilityModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="bg-[#2D6A4F] text-white py-2 rounded-lg hover:bg-[#1B4332] transition-colors shadow-lg text-center"
                    >
                      Déposer votre dossier
                    </button>
                    <button
                      onClick={() => {
                        setIsCriteriaModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-white hover:text-gray-200 py-2 text-center"
                    >
                      Consulter les critères
                    </button>
                  </>
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
    <span className="block">Souhaitez-vous renforcer la résilience de votre exploitation face à la sécheresse grâce à des équipements de récupération et de stockage des eaux pluviales ?</span>
  </p>
  <div className="flex justify-start space-x-4 mt-16">
            {!user && (
              <>
                <button
                  onClick={() => setIsEligibilityModalOpen(true)}
                  className="flex items-center bg-[#2D6A4F] text-white px-8 py-4 rounded-lg hover:bg-[#1B4332] transition-colors shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  Déposer votre dossier maintenant
                  <ArrowRight className="ml-2 w-5 h-5 text-[#E8B647]" />
                </button>
                <button
                  onClick={() => setIsCriteriaModalOpen(true)}
                  className="flex items-center px-8 py-4 text-white hover:text-gray-200 transition-colors"
                >
                  Consulter les critères
                </button>
              </>
            )}
         </div>
        </div>

        <div className="mt-20">
          <h2 className="text-3xl font-bold text-white mb-6">Les étapes</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-white border-opacity-20"
              >
                <div className="text-[#E8B647] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                {feature.description && (
                  <div className="text-gray-300">{feature.description}</div>
                )}
                {feature.buttonLabel && !user && (
                  <button
                    onClick={feature.onClick}
                    className="mt-4 bg-[#2D6A4F] text-white px-4 py-2 rounded-lg hover:bg-[#1B4332] transition-colors shadow-lg"
                  >
                    {feature.buttonLabel}
                  </button>
                )}
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
          </div>
        </div>

        {/* About cards */}
        <div className="mt-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold text-white mb-4">A propos de GBH</h3>
              <p className="text-gray-200">
                GBH. Fondé en 1960, GBH s’est développé à partir des départements d’Outre-mer,
                puis à l’international. Le Groupe est aujourd’hui implanté sur 19 territoires, emploie
                18 000 collaborateurs et a un chiffre d’affaires consolidé de 5 milliards d’euros.
                Groupe familial basé à la Martinique, GBH exerce ses activités autour de trois pôles :
                Un pôle "grande distribution", un pôle "automobile" ainsi qu’un pôle "activités
                industrielles" qui compte notamment la production et la distribution de marques de
                spiritueux ainsi que diverses activités dans le secteur agroalimentaire. Implanté à
                Mayotte depuis 2020, GBH détient la société BDM, Bourbon Distribution Mayotte,
                comprenant deux supermarchés Carrefour et 39 magasins Douka Bé, petits
                magasins d’ultra proximité, répartis dans tous les villages de Mayotte. Le groupe
                est aussi présent à Mayotte dans l’activité automobile avec les marques Hyundai,
                Ada, Bosch et Point S. Au total, 540 collaborateurs travaillent au sein du groupe.
              </p>
              <p className="text-gray-200 mt-4">
                <a
                  href="https://gbh.fr/fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E8B647] underline"
                >
                  Lien vers le site GBH
                </a>
              </p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
              <h3 className="text-2xl font-bold text-white mb-4">A propos de Super Novae</h3>
              <p className="text-gray-200">
                SUPER-NOVAE. ONG humanitaire et de développement, Super Novae intervient
                dans les zones de crise pour renforcer l’accès à la santé, à l’emploi et à l’éducation.
                En s’appuyant sur les dynamiques locales, elle met en œuvre des solutions
                innovantes pour accompagner les populations vers l’autonomie et la résilience.
              </p>
              <p className="text-gray-200 mt-4">
                <a
                  href="https://super-novae.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E8B647] underline"
                >
                  Lien vers le site Super-Novae
                </a>
              </p>
            </div>
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