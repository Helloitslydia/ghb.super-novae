import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ApplicationData {
  status?: string | null;
  created_at?: string | null;
  refusal_reason?: string | null;
  missing_elements_reason?: string | null;
}

function DocumentStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('project_applications')
        .select('created_at,status,refusal_reason,missing_elements_reason')
        .eq('user_id', user.id)
        .single();
      if (!error && data) {
        const allowedStatuses = [
          'Brouillon',
          'Etude du dossier en cours',
          'Validé',
          'Refusé',
          'Elements manquants',
          'Dossier conforme',
        ];
        if (data.status && allowedStatuses.includes(data.status)) {
          setData(data as ApplicationData);
        } else {
          navigate('/documentupload');
          return;
        }
      } else {
        navigate('/documentupload');
        return;
      }
      setLoading(false);
    };
    fetchData();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link to="/documentupload?from=application" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5 mr-2" /> Retour au formulaire
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Votre dossier</h1>
              <p className="text-gray-600">Voici l'état actuel de votre dossier</p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 mb-4">
          Vous serez informé.e.s dans un délai de 15 jours.
        </div>
        <table className="min-w-full bg-white rounded-lg border divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de création
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data && (
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  {data.created_at ? new Date(data.created_at).toLocaleDateString() : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{data.status ?? ''}</td>
              </tr>
            )}
          </tbody>
        </table>
        {data?.status === 'Refusé' && data.refusal_reason && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            Motif du refus : {data.refusal_reason}
          </div>
        )}
        {data?.status === 'Elements manquants' && data.missing_elements_reason && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
            Éléments manquants : {data.missing_elements_reason}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentStatus;
