import React, { useState, FormEvent } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export function ContactWidget() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({ email, message });
      if (error) throw error;
      toast.success('Message envoyé');
      setEmail('');
      setMessage('');
      setOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'envoi';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative animate-fade-in">
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4 text-center">Nous contacter</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2D6A4F] text-white py-2 px-4 rounded-md hover:bg-[#1B4332] disabled:opacity-50"
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
