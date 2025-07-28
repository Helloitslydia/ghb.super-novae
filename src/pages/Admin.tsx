import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import { ApplicationDetailsModal } from "../components/ApplicationDetailsModal";
import { DeleteConfirmationModal } from "../components/DeleteConfirmationModal";
import { supabase } from "../lib/supabase";
import * as XLSX from "xlsx";

type Application = Record<string, any>;

const PASSWORD = "SuperNovae2025";

function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'applications' | 'messages'>('applications');
  const [applicationTab, setApplicationTab] = useState<'enCours' | 'valide' | 'tous'>('enCours');
  const [messages, setMessages] = useState<any[]>([]);
  const [deleteMessageModalOpen, setDeleteMessageModalOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<any | null>(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!authenticated) return;
    if (activeTab === 'applications') {
      loadApplications();
    } else {
      loadMessages();
    }
  }, [authenticated, activeTab, applicationTab]);

  const loadApplications = async () => {
    let query = supabase
      .from('project_applications')
      .select('id, user_id, nom, email, created_at, status');

    if (applicationTab === 'enCours') {
      query = query.eq('status', 'Etude du dossier en cours');
    } else if (applicationTab === 'valide') {
      query = query.eq('status', 'Validé');
    }

    const { data, error } = await query;
    if (!error && data) {
      setApplications(data as Application[]);
    }
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('contact_messages')
      .select('id, email, message, created_at')
      .order('created_at', { ascending: false });
    setMessages(data || []);
  };

  const handleDeleteMessage = (msg: any) => {
    setMessageToDelete(msg);
    setDeleteMessageModalOpen(true);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', messageToDelete.id);
    if (!error) {
      loadMessages();
    } else {
      console.error('Error deleting message:', error);
    }
  };

  const fetchAllApplications = async () => {
    const { data } = await supabase.from("project_applications").select("*");
    setAllApplications(data || []);
    setShowAll(true);
  };

  const exportToExcel = async () => {
    const { data } = await supabase.from('project_applications').select('*');
    if (!data) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'dossiers');
    const wbout = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'dossiers.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fetchApplicationDetails = async (id: string) => {
    const { data } = await supabase
      .from("project_applications")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      const { data: docs } = await supabase
        .from("user_documents")
        .select("id, doc_key, file_path")
        .eq("user_id", data.user_id);
      setSelectedApplication({ ...data, documents: docs || [] });
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


  useEffect(() => {
    setCurrentPage(1);
  }, [filter, statusFilter, applicationTab]);

  const filteredApplications = applications.filter((app) => {
    const query = filter.toLowerCase();
    const matchesQuery =
      (app.nom && app.nom.toLowerCase().includes(query)) ||
      (app.email && app.email.toLowerCase().includes(query));
    const matchesStatus = statusFilter === "" || app.status === statusFilter;
    return matchesQuery && matchesStatus;
  });
  const totalPages = Math.ceil(filteredApplications.length / ITEMS_PER_PAGE);
  const paginatedApplications = filteredApplications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const columns = ["nom", "email", "created_at", "status"];

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2D6A4F] to-[#1B4332] flex items-center justify-center px-4">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-xl space-y-6 w-full max-w-sm"
        >
          <div className="flex flex-col items-center space-y-2">
            <img
              src="//c5ceaa4e16cfaa43c4e175e2d8739333.cdn.bubble.io/f1748260793529x933715376486754600/Linkedin%20Company%20Logo%20%281%29.png"
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
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('applications')}
              className={`pb-1 ${activeTab === 'applications' ? 'border-b-2 border-[#2D6A4F] text-[#2D6A4F]' : 'text-gray-600'}`}
            >
              Dossiers
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-1 ${activeTab === 'messages' ? 'border-b-2 border-[#2D6A4F] text-[#2D6A4F]' : 'text-gray-600'}`}
            >
              Messages
            </button>
          </div>
          {activeTab === 'applications' && (
            <div className="space-x-2">
              <button
                onClick={fetchAllApplications}
                className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-4 py-2 rounded shadow"
              >
                Voir toutes les données
              </button>
              <button
                onClick={exportToExcel}
                className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-4 py-2 rounded shadow"
              >
                Exporter en Excel
              </button>
            </div>
          )}
        </div>
          {activeTab === 'applications' ? (
          <>
            <div className="bg-white p-4 rounded shadow mb-4">
              <label htmlFor="filter" className="block text-sm font-medium mb-2">
                Filtrer les dossiers
              </label>
          <input
            id="filter"
            type="text"
            placeholder="Rechercher par nom ou email"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border p-2 rounded w-full mt-2"
          >
            <option value="">Tous les statuts</option>
            <option value="Etude du dossier en cours">Etude du dossier en cours</option>
            <option value="Validé">Validé</option>
            <option value="Refusé">Refusé</option>
          </select>
        </div>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setApplicationTab('enCours')}
            className={`pb-1 ${applicationTab === 'enCours' ? 'border-b-2 border-[#2D6A4F] text-[#2D6A4F]' : 'text-gray-600'}`}
          >
            En cours
          </button>
          <button
            onClick={() => setApplicationTab('valide')}
            className={`pb-1 ${applicationTab === 'valide' ? 'border-b-2 border-[#2D6A4F] text-[#2D6A4F]' : 'text-gray-600'}`}
          >
            Validé
          </button>
          <button
            onClick={() => setApplicationTab('tous')}
            className={`pb-1 ${applicationTab === 'tous' ? 'border-b-2 border-[#2D6A4F] text-[#2D6A4F]' : 'text-gray-600'}`}
          >
            Tous
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">N°</th>
                {columns.map((col) => (
                  <th key={col} className="px-4 py-2 text-left capitalize">
                    {col === "created_at"
                      ? "Soumis le"
                      : col.replace(/_/g, " ")}
                  </th>
                ))}
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {paginatedApplications.map((app, index) => (
                <tr key={app.id} className="border-t">
                  <td className="px-4 py-2">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-2 break-words">
                      {col === "status" ? (
                        app.status
                      ) : col === "created_at" ? (
                        new Date(app[col]).toLocaleDateString()
                      ) : (
                        String(app[col] ?? "")
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-2">
                    <button
                      onClick={() => fetchApplicationDetails(app.id)}
                      className="text-gray-500 hover:text-blue-600 flex items-center space-x-1"
                      title="Voir plus de détails"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Voir plus de détails</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredApplications.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Aucun dossier
                  </td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${currentPage === page ? "bg-[#2D6A4F] text-white" : ""}`}
            >
              {page}
            </button>
          ))}
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </button>
        </div>
      )}
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Message</th>
                  <th className="px-4 py-2 text-left">Reçu le</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr key={msg.id} className="border-t">
                    <td className="px-4 py-2 break-words">{msg.email}</td>
                    <td className="px-4 py-2 break-words whitespace-pre-wrap">{msg.message}</td>
                    <td className="px-4 py-2">{new Date(msg.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDeleteMessage(msg)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {messages.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Aucun message
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <DeleteConfirmationModal
          isOpen={deleteMessageModalOpen}
          onClose={() => {
            setDeleteMessageModalOpen(false);
            setMessageToDelete(null);
          }}
          onConfirm={confirmDeleteMessage}
          title={messageToDelete?.email || ''}
        />
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
