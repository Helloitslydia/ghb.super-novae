import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Recording {
  id: string;
  title: string;
  created_at: string;
}

interface Transcription {
  id: string;
  original_text: string;
  translated_text: string;
  created_at: string;
}

function Recording() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recording, setRecording] = React.useState<Recording | null>(null);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);

  useEffect(() => {
    loadTranscriptions();
    loadRecording();
  }, []);

  const loadRecording = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading recording:', error);
      navigate('/dashboard');
      return;
    }

    setRecording(data);
  };

  const loadTranscriptions = async () => {
    const { data, error } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('recording_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading transcriptions:', error);
      return;
    }

    setTranscriptions(data || []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="ml-4 text-2xl font-bold">
            {recording?.title || 'Chargement...'}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="space-y-4">
            {transcriptions.map((transcription) => (
              <div
                key={transcription.id} 
                className="bg-gray-50 rounded-lg p-4 space-y-2"
              >
                <p className="text-gray-800">{transcription.original_text}</p>
                <p className="text-gray-600 italic">{transcription.translated_text}</p>
                <p className="text-xs text-gray-400">
                  {new Date(transcription.created_at).toLocaleString()}
                </p>
                <button
                  onClick={() => {
                    const utterance = new SpeechSynthesisUtterance(transcription.original_text);
                    utterance.lang = 'fr-FR';
                    window.speechSynthesis.speak(utterance);
                  }}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                ><Volume2 className="w-4 h-4 mr-1" /> Écouter</button>
              </div>
            ))}
            {transcriptions.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                Aucune transcription disponible pour cet enregistrement
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Recording;