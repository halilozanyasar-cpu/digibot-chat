'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface RegisterForm {
  clinicName: string;
  clinicAddress: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        router.push('/login?message=Kayıt başarılı! Giriş yapabilirsiniz.');
      } else {
        setError(result.message || 'Kayıt sırasında bir hata oluştu.');
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-r from-white to-orange-100 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-orange-600 font-bold text-3xl">D</span>
          </div>
        </div>
        <h2 className="mt-8 text-center text-4xl font-extrabold text-white drop-shadow-lg">
          Hesap Oluştur
        </h2>
        <p className="mt-4 text-center text-lg text-white/90">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="font-medium text-orange-200 hover:text-white transition-colors">
            Giriş yapın
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="glass py-10 px-8 rounded-3xl shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Clinic Name */}
            <div>
              <label htmlFor="clinicName" className="block text-lg font-medium text-white mb-2">
                Klinik Adı
              </label>
              <div className="mt-1">
                <input
                  {...register('clinicName', { required: 'Klinik adı gereklidir' })}
                  type="text"
                  className="form-input"
                  placeholder="Klinik adınızı girin"
                />
                {errors.clinicName && (
                  <p className="mt-1 text-sm text-red-600">{errors.clinicName.message}</p>
                )}
              </div>
            </div>

            {/* Clinic Address */}
            <div>
              <label htmlFor="clinicAddress" className="block text-lg font-medium text-white mb-2">
                Klinik Adresi
              </label>
              <div className="mt-1">
                <textarea
                  {...register('clinicAddress', { required: 'Klinik adresi gereklidir' })}
                  rows={3}
                  className="form-input"
                  placeholder="Klinik adresinizi girin"
                />
                {errors.clinicAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.clinicAddress.message}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-lg font-medium text-white mb-2">
                Telefon
              </label>
              <div className="mt-1">
                <input
                  {...register('phone', { 
                    required: 'Telefon numarası gereklidir',
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Geçerli bir telefon numarası girin'
                    }
                  })}
                  type="tel"
                  className="form-input"
                  placeholder="+90 (5xx) xxx xx xx"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-white mb-2">
                E-posta
              </label>
              <div className="mt-1">
                <input
                  {...register('email', { 
                    required: 'E-posta gereklidir',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Geçerli bir e-posta adresi girin'
                    }
                  })}
                  type="email"
                  className="form-input"
                  placeholder="ornek@klinik.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-lg font-medium text-white mb-2">
                Şifre
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('password', { 
                    required: 'Şifre gereklidir',
                    minLength: {
                      value: 6,
                      message: 'Şifre en az 6 karakter olmalıdır'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="En az 6 karakter"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-lg font-medium text-white mb-2">
                Şifre Tekrar
              </label>
              <div className="mt-1 relative">
                <input
                  {...register('confirmPassword', { 
                    required: 'Şifre tekrarı gereklidir',
                    validate: value => value === password || 'Şifreler eşleşmiyor'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input pr-10"
                  placeholder="Şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-modern disabled:opacity-50 disabled:cursor-not-allowed text-lg py-4"
              >
                {isLoading ? 'Kayıt Oluşturuluyor...' : 'Hesap Oluştur'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 glass rounded-full text-white/80">veya</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/"
                className="w-full flex justify-center items-center px-6 py-3 glass rounded-2xl text-white font-medium hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
