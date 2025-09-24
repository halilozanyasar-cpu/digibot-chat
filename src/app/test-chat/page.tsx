'use client';

import { useState } from 'react';

export default function TestChatPage() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      
      const data = await res.json();
      setResponse(data.response || data.error);
    } catch (error) {
      setResponse('Hata: ' + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Chat API Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="w-full p-3 border rounded-lg mb-4"
          />
          <button
            onClick={testAPI}
            disabled={loading}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Gönderiliyor...' : 'Gönder'}
          </button>
        </div>

        {response && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="font-bold mb-2">Yanıt:</h3>
            <p className="text-gray-700">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

