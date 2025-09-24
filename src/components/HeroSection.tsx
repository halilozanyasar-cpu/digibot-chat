'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, CheckCircle } from 'lucide-react';

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Dijital Cerrahi Rehberleri",
      subtitle: "Modern implantoloji için hassas cerrahi rehberleri",
      description: "3D planlama ve dijital tasarım ile mükemmel implant yerleşimi sağlayın.",
      image: "/api/placeholder/600/400",
      features: ["3D Planlama", "Hassas Tasarım", "Hızlı Üretim"]
    },
    {
      title: "QR Kodlu Rapor Sistemi",
      subtitle: "Hasta takibi ve raporlama",
      description: "Her cerrahi rehber için benzersiz QR kod ile hasta bilgilerine anında erişim.",
      image: "/api/placeholder/600/400",
      features: ["QR Kod", "Hasta Takibi", "Dijital Rapor"]
    },
    {
      title: "AI Cerrahi Asistan",
      subtitle: "Yapay zeka destekli danışmanlık",
      description: "GPT tabanlı cerrahi asistan ile implantoloji konusunda uzman desteği alın.",
      image: "/api/placeholder/600/400",
      features: ["AI Destek", "Uzman Danışmanlık", "7/24 Erişim"]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
            <section className="relative gradient-bg overflow-hidden min-h-screen flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-12 fade-in">
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <div className="space-y-8">
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                  {slides[currentSlide].title}
                </h1>
                <h2 className="text-2xl md:text-3xl text-orange-600 font-semibold">
                  {slides[currentSlide].subtitle}
                </h2>
                <p className="text-xl text-gray-700 leading-relaxed max-w-2xl">
                  {slides[currentSlide].description}
                </p>
              </div>
            </div>

                    {/* Features */}
                    <div className="space-y-6">
                      {slides[currentSlide].features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-6 bg-white rounded-2xl p-6 hover-lift shadow-lg">
                          <CheckCircle size={28} className="text-orange-500" />
                          <span className="text-gray-900 font-medium text-xl">{feature}</span>
                        </div>
                      ))}
                    </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-8">
              <Link href="/register" className="btn-modern inline-flex items-center justify-center space-x-3 text-lg px-8 py-4">
                <span>Hemen Başla</span>
                <ArrowRight size={24} />
              </Link>
              <button className="bg-white text-orange-600 border-2 border-orange-200 hover:border-orange-400 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 hover:scale-105 inline-flex items-center justify-center space-x-3 shadow-lg">
                <Play size={24} />
                <span>Demo İzle</span>
              </button>
            </div>

            {/* Slide Indicators */}
            <div className="flex space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-8 text-center">
                <div className="w-32 h-32 mx-auto bg-orange-500 rounded-full flex items-center justify-center mb-6">
                  <span className="text-white text-4xl font-bold">3D</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {slides[currentSlide].title}
                </h3>
                <p className="text-gray-600">
                  {slides[currentSlide].description}
                </p>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-orange-300 rounded-full opacity-30 animate-bounce"></div>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-orange-300 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-orange-400 rounded-full opacity-25 animate-ping"></div>
      </div>
    </section>
  );
}
