import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic, Pause, Play, Languages } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { translateText } from '../lib/openrouter';
import { useAuth } from '../contexts/AuthContext';

const LANGUAGES = [
  { code: 'en', name: 'Anglais' },
  { code: 'es', name: 'Espagnol' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italien' }
];

function NewRecording() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'recording' | 'paused'>('recording');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [finalTranscripts, setFinalTranscripts] = useState<Array<{ original: string; translated: string | null }>>([]);
  const [currentVoice, setCurrentVoice] = useState<string | null>(null);
  const recognition = useRef<SpeechRecognition | null>(null);

  const toggleRecording = () => {
    if (!recognition.current) return;
    
    if (status === 'recording') {
      recognition.current.stop();
      setStatus('paused');
    } else {
      recognition.current.start();
      setStatus('recording');
    }
  };

  useEffect(() => {
    createNewRecording();
  }, []);

  useEffect(() => {
    if (recordingId) {
      setupSpeechRecognition();
    }
  }, [recordingId]);

  const createNewRecording = async () => {
    const { data, error } = await supabase
      .from('recordings')
      .insert([
        {
          title: `Enregistrement du ${new Date().toLocaleString()}`,
          user_id: user?.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating recording:', error);
      return;
    }

    setRecordingId(data.id);
  };

  const setupSpeechRecognition = () => {
    if (!recordingId) return;

    if ('webkitSpeechRecognition' in window) {
      recognition.current = new webkitSpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'fr-FR';

      recognition.current.onresult = async (event) => {
        let currentTranscript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          // Accumuler tous les résultats pour former une phrase complète
          currentTranscript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join(' '); // Joindre les segments avec des espaces

          // Vérifier si le dernier résultat est final
          isFinal = event.results[event.results.length - 1].isFinal;
        }

        // Mettre à jour la transcription en direct
        setLiveTranscript(currentTranscript);

        // Si la phrase est terminée, la sauvegarder et la traduire
        if (isFinal && currentTranscript.trim()) {
          let translation;
          try {
            translation = await translateText(currentTranscript, targetLanguage);
          } catch (error) {
            console.error('Translation failed:', error);
            translation = '[Erreur de traduction]';
          }

          const { error } = await supabase
            .from('transcriptions')
            .insert([{
              recording_id: recordingId,
              original_text: currentTranscript,
              translated_text: translation,
            }]);

          if (error) {
            console.error('Erreur lors de la sauvegarde:', error);
          } else {
            setFinalTranscripts(prev => [...prev, { 
              original: currentTranscript, 
              translated: translation 
            }]);
            setLiveTranscript('');
          }
        }
      };

      recognition.current.start();
    }
  };

  const stopRecording = () => {
    if (recognition.current) {
      recognition.current.stop();
      if (recordingId) {
        navigate(`/recording/${recordingId}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center mb-8">
          <button onClick={stopRecording} className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="ml-4 text-2xl font-bold">
            Nouvel Enregistrement
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex items-center justify-between w-full max-w-2xl mb-4">
              <div className="flex items-center space-x-3 flex-shrink-0">
                <Languages className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">À traduire en :</span>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-700">Votre poste :</span>
                <input
                  type="text"
                  placeholder="Votre poste"
                  className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={toggleRecording}
              className={`p-6 rounded-full bg-blue-600 transition-colors hover:bg-blue-700 ${
                status === 'recording' ? 'animate-pulse' : ''
              }`}
            >
              {status === 'recording' ? (
                <Pause className="w-8 h-8 text-white" />
              ) : (
                <Play className="w-8 h-8 text-white" />
              )}
            </button>
            <p className="text-lg text-gray-700">
              {status === 'recording' ? 'Enregistrement en cours...' : 'Enregistrement en pause'}
            </p>
            <div className="w-full max-w-2xl overflow-y-auto max-h-[60vh]">
              <div className="space-y-6">
                {/* Transcription en cours */}
                {liveTranscript && (
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-2"></div>
                      <p className="text-blue-800 font-medium">En cours de transcription</p>
                    </div>
                    <p className="text-gray-800 bg-white p-3 rounded-lg border border-blue-100">
                      {liveTranscript}
                    </p>
                  </div>
                )}

                {/* Historique des transcriptions */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <h3 className="font-medium text-gray-800">Historique de la conversation</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {[...finalTranscripts].reverse().map((transcript, index) => (
                      <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                        <pre className="text-gray-800 mb-2 whitespace-pre-wrap font-sans">{transcript.original}</pre>
                        {transcript.translated && (
                          <pre className="text-gray-600 italic text-sm pl-4 border-l-2 border-blue-200 whitespace-pre-wrap font-sans">
                            {transcript.translated}
                          </pre>
                        )}
                      </div>
                    ))}
                    {finalTranscripts.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        Les transcriptions apparaîtront ici
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 text-center mt-6 bg-gray-50 p-4 rounded-lg">
                Parlez naturellement. Vos paroles sont automatiquement transcrites et traduites.
                Cliquez sur le microphone pour mettre en pause/reprendre, ou sur la flèche retour pour terminer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewRecording;