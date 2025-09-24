'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, User, LogIn, LogOut } from 'lucide-react';
// import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // const { data: session } = useSession();
  const session = null; // Geçici olarak devre dışı

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-orange-500 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover-lift">
            <div className="w-12 h-12 bg-gradient-to-r from-white to-orange-100 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-orange-600 font-bold text-2xl">D</span>
            </div>
            <span className="text-2xl font-bold text-white drop-shadow-2xl">Digimplant Solutions</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-orange-200 transition-all duration-300 hover:scale-105 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
              Ana Sayfa
            </Link>
            <Link href="/services" className="text-white hover:text-orange-200 transition-all duration-300 hover:scale-105 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
              Hizmetlerimiz
            </Link>
            <Link href="/about" className="text-white hover:text-orange-200 transition-all duration-300 hover:scale-105 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
              Hakkımızda
            </Link>
            <Link href="/blog" className="text-white hover:text-orange-200 transition-all duration-300 hover:scale-105 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
              Blog
            </Link>
            <Link href="/contact" className="text-white hover:text-orange-200 transition-all duration-300 hover:scale-105 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
              İletişim
            </Link>
      <Link href="/chat" className="text-white hover:text-orange-200 transition-all duration-300 hover:scale-105 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
        AI Asistan
      </Link>
      <Link href="/admin" className="text-white hover:text-orange-200 transition-all duration-300 hover:scale-105 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
        Admin
      </Link>
      <Link href="/admin/planning" className="text-white hover:text-orange-200 transition-all duration-300 hover:scale-105 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
        Planlama
      </Link>
      {session && (
        <Link href="/dashboard" className="text-white hover:text-orange-200 transition-all duration-300 hover:scale-105 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
          Kontrol Paneli
        </Link>
      )}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!session ? (
              <>
                <Link href="/login" className="flex items-center space-x-2 text-white hover:text-orange-200 transition-all duration-300 hover:scale-105 font-medium px-4 py-2 rounded-lg hover:bg-white/10">
                  <LogIn size={20} />
                  <span>Üye Girişi</span>
                </Link>
                <Link href="/register" className="btn-modern">
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <span className="text-white font-medium">Hoş geldiniz, Kullanıcı</span>
                <button 
                  onClick={() => console.log('Sign out clicked')} 
                  className="btn-modern flex items-center space-x-2 ml-4"
                >
                  <LogOut size={20} />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-white hover:text-orange-200 hover:bg-white/10"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-orange-600 py-4">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20 drop-shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link
                href="/services"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20 drop-shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Hizmetlerimiz
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20 drop-shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Hakkımızda
              </Link>
              <Link
                href="/blog"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20 drop-shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20 drop-shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                İletişim
              </Link>
              <Link
                href="/chat"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20 drop-shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                AI Asistan
              </Link>
              {session && (
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20 drop-shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kontrol Paneli
                </Link>
              )}
              <div className="border-t border-white/20 pt-3 mt-3">
                {!session ? (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-white hover:bg-white/20 drop-shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn size={20} />
                      <span>Üye Girişi</span>
                    </Link>
                    <Link
                      href="/register"
                      className="block mx-3 mt-2 btn-modern text-center drop-shadow-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Kayıt Ol
                    </Link>
                  </>
                ) : (
                  <div className="px-3 py-2">
                    <div className="text-white font-medium mb-2 drop-shadow-lg">Hoş geldiniz, Kullanıcı</div>
                    <button 
                      onClick={() => {
                        console.log('Sign out clicked');
                        setIsMenuOpen(false);
                      }} 
                      className="w-full btn-modern flex items-center justify-center space-x-2 drop-shadow-lg"
                    >
                      <LogOut size={20} />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
