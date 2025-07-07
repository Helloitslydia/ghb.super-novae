import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ALLOWED_SIGNUP_DATE = new Date('2024-07-10T16:00:00');

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBeforeAllowedDate, setIsBeforeAllowedDate] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    setIsBeforeAllowedDate(new Date() < ALLOWED_SIGNUP_DATE);
  }, []);

  if (isBeforeAllowedDate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2D6A4F] to-[#1B4332] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <Link to="/" className="flex justify-center items-center space-x-2">
            <img
              src="//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1746787922004x941654894198586100/Capture%20d%E2%80%99e%CC%81cran%202025-05-09%20a%CC%80%2012.51.44.png"
              alt="Logo GBH"
              className="h-8 w-auto"
            />
            <span className="text-2xl font-bold text-white">by GBH</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">Inscriptions bientôt disponibles</h2>
          <p className="mt-2 text-sm text-gray-200">
            La création de compte sera possible le 10 juillet à 16h.
          </p>
          <div className="mt-6">
            <Link to="/login" className="text-white underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isBeforeAllowedDate) {
      setLoading(false);
      setError('La création de compte sera possible le 10 juillet à 16h.');
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (signUpError) throw signUpError;

      // Rediriger vers la page d'envoi des documents
      navigate('/upload-docs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2D6A4F] to-[#1B4332] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center space-x-2">
          <img
            src="//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1746787922004x941654894198586100/Capture%20d%E2%80%99e%CC%81cran%202025-05-09%20a%CC%80%2012.51.44.png"
            alt="Logo GBH"
            className="h-8 w-auto"
          />
          <span className="text-2xl font-bold text-white">by GBH</span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-white">
          Créez votre compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-200">
          Déposez votre dossier et suivez son avancement en ligne
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jean Dupont"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse email
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              {error && (
                <div className="mb-4 text-sm text-red-600">
                  {error}
                </div>
              )}
              {isBeforeAllowedDate && (
                <div className="mb-4 text-sm text-red-600">
                  La création de compte sera possible le 10 juillet à 16h.
                </div>
              )}
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2D6A4F] hover:bg-[#1B4332] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2D6A4F] disabled:opacity-50"
                disabled={loading || isBeforeAllowedDate}
              >
                {loading ? 'Création en cours...' : 'Créer mon compte'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Déjà inscrit ?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#2D6A4F] bg-white hover:bg-gray-50"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
