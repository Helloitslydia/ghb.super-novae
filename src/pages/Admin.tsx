import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { ApplicationDetailsModal } from "../components/ApplicationDetailsModal";
import { supabase } from "../lib/supabase";

interface Application {
  id: string;
  user_id: string;
  nom: string | null;
  email: string | null;
  status: string;
  created_at: string;
}

const PASSWORD = "SuperNovae2025";

function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);

  useEffect(() => {
    if (authenticated) {
      loadApplications();
    }
  }, [authenticated]);

  const loadApplications = async () => {
    const { data, error } = await supabase
      .from("project_applications")
      .select("id, user_id, nom, email, status, created_at")
      .eq("status", "Etude du dossier en cours");
    if (!error && data) {
      setApplications(data as Application[]);
    }
  };

  const fetchAllApplications = async () => {
    const { data } = await supabase.from("project_applications").select("*");
    setAllApplications(data || []);
    setShowAll(true);
  };

  const fetchApplicationDetails = async (id: string) => {
    const { data } = await supabase
      .from("project_applications")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      setSelectedApplication(data);
      setShowDetails(true);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Mot de passe incorrect");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("project_applications")
      .update({ status })
      .eq("id", id);
    if (!error) {
      await loadApplications();
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2D6A4F] to-[#1B4332] flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-xl space-y-6 w-full max-w-sm"
        >
          <div className="flex flex-col items-center space-y-2">
            <img
              src="//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1746787922004x941654894198586100/Capture%20d%E2%80%99e%CC%81cran%202025-05-09%20a%CC%80%2012.51.44.png"
              alt="Logo GBH"
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-bold text-gray-800">
              Accès administrateur
            </h1>
          </div>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 rounded w-full"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-4 py-2 rounded w-full"
          >
            Valider
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Retour
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Administration</h1>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Dossiers en cours d'étude</h2>
          <button
            onClick={fetchAllApplications}
            className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-4 py-2 rounded shadow"
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
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <span>{app.status}</span>
                      <button
                        onClick={() => fetchApplicationDetails(app.id)}
                        className="text-gray-500 hover:text-blue-600"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className="border rounded p-1"
                      value={app.status}
                      onChange={(e) => updateStatus(app.id, e.target.value)}
                    >
                      <option value="Etude du dossier en cours">
                        Etude du dossier en cours
                      </option>
                      <option value="Validé">Validé</option>
                      <option value="Refusé">Refusé</option>
                    </select>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
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
        {showDetails && selectedApplication && (
          <ApplicationDetailsModal
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
            application={selectedApplication}
          />
        )}
      </div>
    </div>
  );
}

export default Admin;
