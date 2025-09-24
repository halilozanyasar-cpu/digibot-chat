'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  CreditCard,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';

interface ReportData {
  _id: string;
  patientName: string;
  implantDetails: {
    brand: string;
    model: string;
    count: number;
    positions: string[];
  };
  prosthesisType: string;
  surgicalPlan: {
    approach: string;
    boneQuality: string;
    recommendations: string[];
  };
  teethData: Array<{
    toothNumber: string;
    implantBrand: string;
    implantModel: string;
    implantDiameter: string;
    implantLength: string;
    expectedBoneQuality: string;
    recommendedDrillProtocol: string;
  }>;
  clinicalNotes: string;
  pricing: {
    guidePrice: number;
    sleevePrice: number;
    totalAmount: number;
    provisionAmount: number;
  };
  status: string;
  createdAt: string;
}

export default function ApprovePage() {
  const params = useParams();
  const reportId = params.id as string;
  const [report, setReport] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  useEffect(() => {
    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  const fetchReport = async () => {
    try {
      // Önce normal API'yi dene
      let response = await fetch(`/api/reports/${reportId}`);
      
      // Eğer başarısız olursa mock API'yi dene
      if (!response.ok) {
        response = await fetch(`/api/mock-reports/${reportId}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        console.error('Failed to fetch report from both APIs');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (approved) {
      setShowPaymentModal(true);
    } else {
      // Reddetme işlemi
      setIsApproving(true);
      try {
        const response = await fetch(`/api/approve/${reportId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ approved: false, reason: 'Kullanıcı tarafından reddedildi' }),
        });

        if (response.ok) {
          alert('Plan reddedildi. Admin ile iletişime geçin.');
        } else {
          alert('Hata oluştu. Lütfen tekrar deneyin.');
        }
      } catch (error) {
        console.error('Error rejecting plan:', error);
        alert('Hata oluştu. Lütfen tekrar deneyin.');
      } finally {
        setIsApproving(false);
      }
    }
  };

  const processPayment = async () => {
    setIsApproving(true);
    try {
      const response = await fetch(`/api/approve/${reportId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          approved: true, 
          paymentData: paymentData,
          totalAmount: report?.pricing.totalAmount,
          provisionAmount: report?.pricing.provisionAmount
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Plan onaylandı ve ödeme alındı! Rehber hazırlanacak.');
        setShowPaymentModal(false);
        // Rapor sayfasına yönlendir
        window.location.href = `/report/${reportId}`;
      } else {
        alert('Ödeme işlemi başarısız: ' + data.message);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Ödeme işlemi sırasında hata oluştu.');
    } finally {
      setIsApproving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Rapor yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Rapor Bulunamadı</h2>
          <p className="text-gray-600">Aradığınız rapor mevcut değil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🏥 Plan Onayı</h1>
              <p className="text-2xl text-orange-600 font-semibold">👤 Hasta: {report.patientName}</p>
            </div>
            <div className="text-right">
              <p className="text-lg text-gray-600">📅 Tarih: {new Date(report.createdAt).toLocaleDateString('tr-TR')}</p>
              <p className="text-sm text-gray-500">Rapor ID: {report._id}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-6 h-6 mr-2 text-orange-500" />
                👤 Hasta Bilgileri
              </h3>
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                <p className="text-xl font-semibold text-gray-900">👤 Hasta: {report.patientName}</p>
                <p className="text-lg text-gray-700">📋 Rapor No: {report._id}</p>
              </div>
            </div>

            {/* Implant Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🦷 İmplant Detayları</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <span className="font-bold text-gray-700">🏷️ Marka:</span>
                  <p className="text-lg font-semibold">{report.implantDetails.brand}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <span className="font-bold text-gray-700">🔧 Model:</span>
                  <p className="text-lg font-semibold">{report.implantDetails.model}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <span className="font-bold text-gray-700">📊 Sayı:</span>
                  <p className="text-lg font-semibold">{report.implantDetails.count} adet</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <span className="font-bold text-gray-700">📍 Pozisyonlar:</span>
                  <p className="text-lg font-semibold">{report.implantDetails.positions.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Teeth Data */}
            {report.teethData && report.teethData.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">🦷 Diş Detayları</h3>
                <div className="space-y-4">
                  {report.teethData.map((tooth, index) => (
                    <div key={index} className="border-2 border-orange-200 rounded-xl p-4 bg-gradient-to-r from-blue-50 to-blue-100">
                      <h4 className="text-xl font-bold text-gray-900 mb-3">🦷 Diş #{tooth.toothNumber}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="font-bold text-gray-700">🏷️ Marka:</span>
                          <p className="font-semibold">{tooth.implantBrand}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="font-bold text-gray-700">🔧 Model:</span>
                          <p className="font-semibold">{tooth.implantModel}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="font-bold text-gray-700">📏 Çap:</span>
                          <p className="font-semibold">{tooth.implantDiameter} mm</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="font-bold text-gray-700">📐 Uzunluk:</span>
                          <p className="font-semibold">{tooth.implantLength} mm</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <span className="font-bold text-gray-700">🦴 Kemik:</span>
                          <p className="font-semibold">{tooth.expectedBoneQuality}</p>
                        </div>
                      </div>
                      <div className="mt-3 bg-yellow-50 rounded-lg p-3 border-2 border-yellow-200">
                        <span className="font-bold text-gray-700">⚙️ Frez Protokolü:</span>
                        <p className="text-sm font-semibold mt-1">{tooth.recommendedDrillProtocol}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Notes */}
            {report.clinicalNotes && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">📝 Klinik Notlar</h3>
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-lg font-semibold whitespace-pre-wrap">{report.clinicalNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Pricing & Actions */}
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-6 h-6 mr-2 text-orange-500" />
                💰 Fiyat Bilgileri
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Rehber Ücreti:</span>
                  <span className="font-semibold">₺{report.pricing.guidePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sleeve Ücreti:</span>
                  <span className="font-semibold">₺{report.pricing.sleevePrice}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>Toplam:</span>
                  <span className="font-bold text-xl">₺{report.pricing.totalAmount}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Provizyon (%20):</span>
                  <span className="font-bold">₺{report.pricing.provisionAmount}</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mr-2 mt-1" />
                <div>
                  <h4 className="font-bold text-yellow-800 mb-2">⚠️ Önemli Bilgi</h4>
                  <p className="text-yellow-700 text-sm">
                    Planı onayladığınızda kredi kartınızdan <strong>₺{report.pricing.totalAmount}</strong> tahsil edilecektir. 
                    Provizyon, rehberin geri dönmeme ihtimaline karşı alınmaktadır.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => window.open(`/report/${reportId}`, '_blank')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg inline-flex items-center justify-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>📋 Detaylı Raporu Görüntüle</span>
              </button>
              
              <button
                onClick={() => handleApproval(true)}
                disabled={isApproving}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold text-lg inline-flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                <span>✅ Planı Onayla ve Öde</span>
              </button>
              
              <button
                onClick={() => handleApproval(false)}
                disabled={isApproving}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold text-lg inline-flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                <span>❌ Planı Reddet</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">💳 Ödeme Bilgileri</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kart Numarası</label>
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                  className="form-input w-full"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Son Kullanma</label>
                  <input
                    type="text"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                  <input
                    type="text"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                    className="form-input w-full"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kart Sahibi</label>
                <input
                  type="text"
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, cardName: e.target.value }))}
                  placeholder="Ad Soyad"
                  className="form-input w-full"
                />
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span>Toplam Tutar:</span>
                  <span className="font-bold">₺{report?.pricing.totalAmount}</span>
                </div>
                <div className="flex justify-between text-orange-600">
                  <span>Provizyon:</span>
                  <span className="font-bold">₺{report?.pricing.provisionAmount}</span>
                </div>
              </div>
              
              <button
                onClick={processPayment}
                disabled={isApproving}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold text-lg inline-flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" />
                <span>{isApproving ? 'İşleniyor...' : 'Ödemeyi Tamamla'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
