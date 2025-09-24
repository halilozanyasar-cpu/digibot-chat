'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  QrCode,
  Home,
  ArrowLeft
} from 'lucide-react';

interface Order {
  _id: string;
  patientName: string;
  implantBrand: string;
  implantModel: string;
  implantCount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalPrice: number;
  createdAt: string;
  qrCode?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'processing':
        return 'İşleniyor';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ödeme Bekliyor';
      case 'paid':
        return 'Ödendi';
      case 'failed':
        return 'Ödeme Başarısız';
      case 'refunded':
        return 'İade Edildi';
      default:
        return status;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

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
                <h1 className="text-3xl font-bold text-white">Kontrol Paneli</h1>
                <p className="text-white/90 text-lg">Hoş geldiniz, {session.user.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col min-h-screen">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-2xl p-8 hover-lift shadow-lg">
            <div className="flex items-center">
              <div className="p-4 bg-orange-100 rounded-2xl">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-6">
                <p className="text-lg font-medium text-gray-600">Toplam Sipariş</p>
                <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 hover-lift shadow-lg">
            <div className="flex items-center">
              <div className="p-4 bg-orange-100 rounded-2xl">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-6">
                <p className="text-lg font-medium text-gray-600">Bekleyen</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orders.filter(order => order.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 hover-lift shadow-lg">
            <div className="flex items-center">
              <div className="p-4 bg-orange-100 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-6">
                <p className="text-lg font-medium text-gray-600">Tamamlanan</p>
                <p className="text-3xl font-bold text-gray-900">
                  {orders.filter(order => order.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 hover-lift shadow-lg">
            <div className="flex items-center">
              <div className="p-4 bg-orange-100 rounded-2xl">
                <QrCode className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-6">
                <p className="text-lg font-medium text-gray-600">Toplam Tutar</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₺{orders.reduce((sum, order) => sum + order.totalPrice, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-2xl mt-8 flex-1">
          <div className="px-8 py-8 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Siparişlerim</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Henüz siparişiniz yok</h3>
              <p className="text-gray-600 text-lg mb-8">İlk cerrahi rehber siparişinizi oluşturmak için başlayın.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hasta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İmplant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ödeme
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tutar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.patientName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.implantBrand} {order.implantModel}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.implantCount} adet
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-2 text-sm text-gray-900">
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-800'
                            : order.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {getPaymentStatusText(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₺{order.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/dashboard/orders/${order._id}`}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            <Eye size={16} />
                          </Link>
                          {order.qrCode && (
                            <Link
                              href={`/report/${order._id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <QrCode size={16} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer with Create New Order Button */}
        <div className="mt-auto pt-8">
          <div className="bg-orange-500 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-4">Yeni Sipariş Oluşturmak İstiyor musunuz?</h3>
            <Link href="/dashboard/new-order" className="bg-white text-orange-600 hover:bg-orange-50 inline-flex items-center space-x-3 text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
              <Plus size={24} />
              <span>Yeni Sipariş Oluştur</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
