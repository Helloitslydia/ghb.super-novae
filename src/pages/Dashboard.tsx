import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Mic, Clock, Pencil, Check, X, Search, Calendar, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';
import { DeleteConfirmationModal } from '../components/DeleteConfirmationModal';
import { supabase } from '../lib/supabase';

interface Recording {
  id: string;
  title: string;
  created_at: string;
}

function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingTitle, setEditingTitle] = React.useState('');
  const [recordings, setRecordings] = React.useState<Recording[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateFilter, setDateFilter] = React.useState('');
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [recordingToDelete, setRecordingToDelete] = React.useState<Recording | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const recordingsPerPage = 5;
  const [userStatus, setUserStatus] = React.useState<string>('active');

  React.useEffect(() => {
    if (user) {
      loadUserStatus();
    }
  }, [user]);

  React.useEffect(() => {
    const checkApplication = async () => {
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
        navigate('/application');
      }
    };

    checkApplication();
  }, [user, navigate]);

  const loadUserStatus = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('status')
      .eq('id', user?.id)
      .single();

    if (!error && data) {
      setUserStatus(data.status);
    } else {
      console.error('Error loading user status:', error);
      setUserStatus('active'); // Valeur par défaut si erreur
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const handleDeleteRecording = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const recording = recordings.find(r => r.id === id);
    setRecordingToDelete(recording || null);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordingToDelete) return;
    
    try {
      const { data, error } = await supabase
        .from('recordings')
        .delete()
        .match({ id: recordingToDelete.id, user_id: user?.id });
        
      if (error) {
        console.error('Error deleting recording:', error);
        toast.error('Erreur lors de la suppression: ' + error.message);
        return;
      }

      toast.success('Enregistrement et transcriptions supprimés avec succès');
      
      await loadRecordings();
    } catch (error) {
      console.error('Error deleting recording:', error);
      toast.error('Une erreur inattendue est survenue');
    }
  };

  React.useEffect(() => {
    loadRecordings();
  }, []);

  const filteredRecordings = React.useMemo(() => {
    return recordings.filter(recording => {
      const matchesSearch = recording.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || recording.created_at.startsWith(dateFilter);
      return matchesSearch && matchesDate;
    });
  }, [recordings, searchTerm, dateFilter]);

  const paginatedRecordings = React.useMemo(() => {
    const startIndex = (currentPage - 1) * recordingsPerPage;
    return filteredRecordings.slice(startIndex, startIndex + recordingsPerPage);
  }, [filteredRecordings, currentPage]);

  const totalPages = Math.ceil(filteredRecordings.length / recordingsPerPage);

  const handleEditTitle = async (id: string) => {
    if (!editingTitle.trim()) {
      setEditingId(null);
      setEditingTitle('');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recordings')
        .update({ 
          title: editingTitle.trim() 
        })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) throw error;

      await loadRecordings();
      toast.success('Titre modifié avec succès');

      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Erreur lors de la modification du titre');
      await loadRecordings();
    }
  };

  const loadRecordings = async () => {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading recordings:', error);
      return;
    }

    setRecordings(data || []);
  };

  const startNewRecording = async () => {
    navigate('/new-recording');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="ml-2 text-xl font-bold">OkMeeting</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">{user?.email}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userStatus)}`}>
                  {userStatus}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col items-center space-y-8">
            <DeleteConfirmationModal
              isOpen={deleteModalOpen}
              onClose={() => {
                setDeleteModalOpen(false);
                setRecordingToDelete(null);
              }}
              onConfirm={confirmDelete}
              title={recordingToDelete?.title || ''}
            />
            <button
              onClick={startNewRecording}
              className="p-4 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Mic className="w-6 h-6 text-white" />
            </button>
            <p className="text-gray-600">Cliquez pour démarrer un nouvel enregistrement traduction</p>

            <div className="w-full max-w-3xl mt-12">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <Clock className="w-6 h-6 mr-2" />
                Enregistrements passés
              </h2>
              
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher par titre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="pl-10 w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {paginatedRecordings.map((recording) => (
                  <Link
                    key={recording.id}
                    className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
                    to={editingId === recording.id ? undefined : `/recording/${recording.id}`}
                  >
                    <div className="flex justify-between items-center">
                      {editingId === recording.id ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleEditTitle(recording.id);
                            }} 
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingId(null);
                              setEditingTitle('');
                            }}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="font-medium">{recording.title}</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingId(recording.id);
                              setEditingTitle(recording.title);
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          {new Date(recording.created_at).toLocaleString()}
                        </span>
                        <button
                          onClick={(e) => handleDeleteRecording(e, recording.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
                {filteredRecordings.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    {recordings.length === 0 
                      ? "Aucun enregistrement pour le moment"
                      : "Aucun enregistrement ne correspond à vos critères de recherche"
                    }
                  </p>
                )}
                
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Précédent
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;