import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Application {
  id: string;
  user_id: string;
  nom: string | null;
  email: string | null;
  status: string;
  created_at: string;
}

const PASSWORD = 'SuperNovae2025';

function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [allApplications, setAllApplications] = useState<any[]>([]);

  useEffect(() => {
    if (authenticated) {
      loadApplications();
    }
  }, [authenticated]);

  const loadApplications = async () => {
    const { data, error } = await supabase
      .from('project_applications')
      .select('id, user_id, nom, email, status, created_at')
      .eq('status', 'Etude du dossier en cours');
    if (!error && data) {
      setApplications(data as Application[]);
    }
  };

  const fetchAllApplications = async () => {
    const { data } = await supabase.from('project_applications').select('*');
    setAllApplications(data || []);
    setShowAll(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('project_applications')
      .update({ status })
      .eq('id', id);
    if (!error) {
      await loadApplications();
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md space-y-4">
          <h1 className="text-xl font-bold">Accès administrateur</h1>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-64"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Valider
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Dossiers en cours d'étude</h1>
        <button
          onClick={fetchAllApplications}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Voir toutes les données
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Nom</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Soumis le</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-t">
                <td className="px-4 py-2">{app.nom}</td>
                <td className="px-4 py-2">{app.email}</td>
                <td className="px-4 py-2">
                  {new Date(app.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">{app.status}</td>
                <td className="px-4 py-2">
                  <select
                    className="border rounded p-1"
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value)}
                  >
                    <option value="Etude du dossier en cours">Etude du dossier en cours</option>
                    <option value="Validé">Validé</option>
                    <option value="Refusé">Refusé</option>
                  </select>
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Aucun dossier
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showAll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-h-[90vh] overflow-auto w-[90vw] max-w-5xl">
            <h2 className="text-xl font-bold mb-4">Toutes les données</h2>
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(allApplications, null, 2)}
            </pre>
            <button
              onClick={() => setShowAll(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
