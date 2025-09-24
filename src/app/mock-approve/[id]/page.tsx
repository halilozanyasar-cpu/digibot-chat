'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  Download,
  Eye,
  MessageCircle,
  AlertTriangle,
  CreditCard,
  Clock
} from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

interface MockReportData {
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
  surgicalReportPDFs: string[];
  pricing: {
    guidePrice: number;
    sleevePrice: number;
    totalAmount: number;
    provisionAmount: number;
  };
  status: string;
  createdAt: string;
  userName: string;
  userEmail: string;
}

export default function MockApprovePage() {
  const params = useParams();
  const [report, setReport] = useState<MockReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchReport();
    }
  }, [params.id]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/mock-reports/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else {
        setReport(null);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!report) return;
    
    setIsApproving(true);
    try {
      const response = await fetch(`/api/mock-approve/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Plan onaylandı! Ödeme işlemi başlatıldı.');
        setReport(prev => prev ? { ...prev, status: 'approved' } : null);
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving report:', error);
      alert('Onay işlemi sırasında hata oluştu: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!report || !rejectionReason.trim()) {
      alert('Lütfen red sebebini belirtin.');
      return;
    }
    
    setIsRejecting(true);
    try {
      const response = await fetch(`/api/mock-approve/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'reject',
          reason: rejectionReason 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Plan reddedildi. Geri bildirim admin\'e iletildi.');
        setReport(prev => prev ? { ...prev, status: 'rejected' } : null);
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
      alert('Red işlemi sırasında hata oluştu: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsRejecting(false);
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
          <p className="text-gray-600">Aradığınız rapor mevcut değil veya erişim yetkiniz yok.</p>
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">📋 Plan Onay Sayfası</h1>
              <p className="text-2xl text-orange-600 font-semibold">👤 Hasta: {report.patientName}</p>
              <p className="text-lg text-gray-600 mt-1">📅 Rapor No: {report._id}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowChat(!showChat)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg inline-flex items-center space-x-3 transition-colors"
              >
                <MessageCircle size={24} />
                <span>🤖 AI Asistan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Banner */}
            <div className={`rounded-lg p-6 ${
              report.status === 'approved' ? 'bg-green-50 border-2 border-green-200' :
              report.status === 'rejected' ? 'bg-red-50 border-2 border-red-200' :
              'bg-yellow-50 border-2 border-yellow-200'
            }`}>
              <div className="flex items-center space-x-3">
                {report.status === 'approved' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : report.status === 'rejected' ? (
                  <XCircle className="w-8 h-8 text-red-600" />
                ) : (
                  <Clock className="w-8 h-8 text-yellow-600" />
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {report.status === 'approved' ? '✅ Plan Onaylandı' :
                     report.status === 'rejected' ? '❌ Plan Reddedildi' :
                     '⏳ Onay Bekliyor'}
                  </h3>
                  <p className="text-gray-600">
                    {report.status === 'approved' ? 'Plan onaylandı ve ödeme işlemi tamamlandı.' :
                     report.status === 'rejected' ? 'Plan reddedildi. Geri bildirim admin\'e iletildi.' :
                     'Planınızı inceleyin ve onaylayın veya reddedin.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Patient Information */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">👤 Hasta Bilgileri</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <span className="font-semibold text-gray-700">Hasta Adı:</span>
                  <p className="text-lg text-gray-900">{report.patientName}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">İmplant Markası:</span>
                  <p className="text-lg text-gray-900">{report.implantDetails.brand}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">İmplant Modeli:</span>
                  <p className="text-lg text-gray-900">{report.implantDetails.model}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">İmplant Sayısı:</span>
                  <p className="text-lg text-gray-900">{report.implantDetails.count}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Pozisyonlar:</span>
                  <p className="text-lg text-gray-900">{report.implantDetails.positions.join(', ')}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Protez Tipi:</span>
                  <p className="text-lg text-gray-900">{report.prosthesisType}</p>
                </div>
              </div>
            </div>

            {/* Surgical Report PDFs */}
            {report.surgicalReportPDFs && report.surgicalReportPDFs.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">📄 Cerrahi Raporları</h3>
                <div className="space-y-4">
                  {report.surgicalReportPDFs.map((pdf, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-6 h-6 text-red-500" />
                          <span className="font-medium text-gray-900">
                            Cerrahi Raporu {index + 1}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => window.open(pdf, '_blank')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm inline-flex items-center space-x-1"
                          >
                            <Eye size={16} />
                            <span>Görüntüle</span>
                          </button>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = pdf;
                              link.download = `cerrahi-raporu-${index + 1}.pdf`;
                              link.click();
                            }}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm inline-flex items-center space-x-1"
                          >
                            <Download size={16} />
                            <span>İndir</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teeth Data */}
            {report.teethData && report.teethData.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">🦷 Diş Detayları</h3>
                <div className="space-y-6">
                  {report.teethData.map((tooth, index) => (
                    <div key={index} className="border-2 border-orange-200 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-blue-100">
                      <h4 className="text-xl font-bold text-gray-900 mb-4">
                        🦷 Diş #{tooth.toothNumber}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <span className="font-semibold text-gray-700">Marka:</span>
                          <p className="text-gray-900">{tooth.implantBrand}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Model:</span>
                          <p className="text-gray-900">{tooth.implantModel}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Çap:</span>
                          <p className="text-gray-900">{tooth.implantDiameter} mm</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Uzunluk:</span>
                          <p className="text-gray-900">{tooth.implantLength} mm</p>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Kemik Kalitesi:</span>
                          <p className="text-gray-900">{tooth.expectedBoneQuality}</p>
                        </div>
                        <div className="col-span-2 md:col-span-3">
                          <span className="font-semibold text-gray-700">Frez Protokolü:</span>
                          <p className="text-gray-900 whitespace-pre-wrap">{tooth.recommendedDrillProtocol}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Notes */}
            {report.clinicalNotes && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">📝 Klinik Notlar</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{report.clinicalNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Fiyatlandırma</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rehber Ücreti:</span>
                  <span className="font-semibold">₺{report.pricing.guidePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sleeve Ücreti:</span>
                  <span className="font-semibold">₺{report.pricing.sleevePrice}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Toplam:</span>
                    <span className="font-bold text-orange-600">₺{report.pricing.totalAmount}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teminat:</span>
                  <span className="font-semibold">₺{report.pricing.provisionAmount}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {report.status === 'pending_approval' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ İşlemler</h3>
                
                {/* Approve Button */}
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold mb-4 inline-flex items-center justify-center space-x-2"
                >
                  {isApproving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Onaylanıyor...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      <span>✅ Planı Onayla</span>
                    </>
                  )}
                </button>

                {/* Reject Section */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">❌ Planı Reddet</h4>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Red sebebini belirtin..."
                    className="w-full p-3 border border-gray-300 rounded-lg mb-3 text-sm"
                    rows={3}
                  />
                  <button
                    onClick={handleReject}
                    disabled={isRejecting || !rejectionReason.trim()}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-semibold inline-flex items-center justify-center space-x-2"
                  >
                    {isRejecting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Reddediliyor...</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        <span>Reddet</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Payment Info */}
            {report.status === 'approved' && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-bold text-green-800">Ödeme Tamamlandı</h3>
                </div>
                <p className="text-green-700 text-sm">
                  Plan onaylandı ve ödeme işlemi başarıyla tamamlandı. 
                  Rehber üretimi başlayacak.
                </p>
              </div>
            )}

            {/* Warning */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Önemli Uyarı</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Planı onayladığınızda, rehber ücreti otomatik olarak tahsil edilecektir. 
                    Lütfen planı dikkatlice inceleyin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Interface */}
      {showChat && (
        <div className="fixed bottom-4 right-4 z-50">
          <ChatInterface reportId={report._id} />
        </div>
      )}
    </div>
  );
}

