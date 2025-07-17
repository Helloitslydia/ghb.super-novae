import React, { useState, useEffect, FormEvent } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  message: string;
  from_admin: boolean;
  created_at: string;
}

export function ContactWidget() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(() => localStorage.getItem('chatEmail') || '');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && email) {
      fetchMessages();
    }
  }, [open, email]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setMessages(data as ChatMessage[]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Veuillez renseigner votre email');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({ email, message, from_admin: false });
      if (error) throw error;
      localStorage.setItem('chatEmail', email);
      setMessage('');
      fetchMessages();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'envoi";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative animate-fade-in flex flex-col h-[80vh]">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">Nous contacter</h2>
            <div className="mb-2">
              <label htmlFor="chat-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="chat-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto mb-4 space-y-2 border p-2 rounded">
              {messages.map((m) => (
                <div key={m.id} className={`text-sm ${m.from_admin ? 'text-right' : ''}`}>
                  <span className={`inline-block px-3 py-2 rounded-lg ${m.from_admin ? 'bg-gray-200' : 'bg-blue-100'}`}>{m.message}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#2D6A4F] text-white py-2 px-4 rounded-md hover:bg-[#1B4332] disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 bg-[#2D6A4F] text-white py-2 px-4 rounded-full shadow-lg flex items-center space-x-2 z-40"
      >
        <MessageCircle className="w-4 h-4 text-[#E8B647]" />
        <span>Un problème ? Contactez-nous</span>
      </button>
    </>
  );
}
