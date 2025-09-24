'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { ArrowLeft, MessageCircle, Bot, Zap } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <div className="bg-orange-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center space-x-8">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-white hover:text-orange-200 transition-all duration-300 hover:scale-105 bg-white/10 rounded-lg px-4 py-2"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Ana Sayfa</span>
              </Link>
              <div className="h-6 w-px bg-white/30"></div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI Cerrahi Asistan</h1>
                <p className="text-white/90 text-lg">7/24 GPT destekli danışmanlık hizmeti</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Features */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 text-orange-500 mr-2" />
                AI Asistan Özellikleri
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm">Cerrahi rehber danışmanlığı</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm">Fiyatlandırma bilgileri</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm">Teknik destek</span>
                </li>
                <li className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                  <span className="text-sm">7/24 hizmet</span>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 text-orange-500 mr-2" />
                Hızlı Sorular
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    // Bu butonlara tıklandığında chat'e mesaj gönder
                    const chatInput = document.querySelector('input[placeholder="Mesajınızı yazın..."]') as HTMLInputElement;
                    if (chatInput) {
                      chatInput.value = "Cerrahi rehber ne kadar sürede hazırlanır?";
                      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                  className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-sm text-gray-700"
                >
                  Cerrahi rehber ne kadar sürede hazırlanır?
                </button>
                <button 
                  onClick={() => {
                    const chatInput = document.querySelector('input[placeholder="Mesajınızı yazın..."]') as HTMLInputElement;
                    if (chatInput) {
                      chatInput.value = "Fiyatlandırma planları nelerdir?";
                      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                  className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-sm text-gray-700"
                >
                  Fiyatlandırma planları nelerdir?
                </button>
                <button 
                  onClick={() => {
                    const chatInput = document.querySelector('input[placeholder="Mesajınızı yazın..."]') as HTMLInputElement;
                    if (chatInput) {
                      chatInput.value = "QR kod sistemi nasıl çalışır?";
                      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                  className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-sm text-gray-700"
                >
                  QR kod sistemi nasıl çalışır?
                </button>
                <button 
                  onClick={() => {
                    const chatInput = document.querySelector('input[placeholder="Mesajınızı yazın..."]') as HTMLInputElement;
                    if (chatInput) {
                      chatInput.value = "Teknik destek nasıl alabilirim?";
                      chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                  className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-sm text-gray-700"
                >
                  Teknik destek nasıl alabilirim?
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-orange-500 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                İletişim
              </h3>
              <p className="text-orange-100 text-sm mb-4">
                AI asistan yeterli değilse, doğrudan bizimle iletişime geçin.
              </p>
              <Link 
                href="/contact"
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-50 transition-colors inline-block"
              >
                İletişim Formu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
