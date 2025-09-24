'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { 
  Download, 
  Printer, 
  Share2, 
  MessageCircle,
  FileText,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Upload,
  Eye,
  Edit3,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

interface ToothData {
  toothNumber: string;
  implantBrand: string;
  implantModel: string;
  implantDiameter: string;
  implantLength: string;
  expectedBoneQuality: string;
  recommendedDrillProtocol: string;
}

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
  qrCode: string;
  reportUrl: string;
  status: string;
  createdAt: string;
  orderId: string;
  // Yeni alanlar
  surgicalReportPDF?: string;
  teethData?: ToothData[];
  clinicalNotes?: string;
}

export default function ReportPage() {
  const params = useParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTooth, setEditingTooth] = useState<ToothData | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreview, setPdfPreview] = useState<string>('');

  useEffect(() => {
    if (params.id) {
      fetchReport();
    }
  }, [params.id]);

  const fetchReport = async () => {
    try {
      // Önce normal API'yi dene
      let response = await fetch(`/api/reports/${params.id}`);
      
      // Eğer başarısız olursa mock API'yi dene
      if (!response.ok) {
        response = await fetch(`/api/mock-reports/${params.id}`);
      }
      
      if (response.ok) {
        const data = await response.json();
        setReport(data);
        setClinicalNotes(data.clinicalNotes || '');
        
        // Generate QR code
        if (data.qrCode) {
          const qrCodeUrl = await QRCode.toDataURL(data.qrCode, {
            width: 200,
            margin: 2,
            color: {
              dark: '#FF7A00',
              light: '#FFFFFF'
            }
          });
          setQrCodeDataUrl(qrCodeUrl);
        }
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTooth = () => {
    const newTooth: ToothData = {
      toothNumber: '',
      implantBrand: '',
      implantModel: '',
      implantDiameter: '',
      implantLength: '',
      expectedBoneQuality: '',
      recommendedDrillProtocol: ''
    };
    setEditingTooth(newTooth);
  };

  const saveTooth = () => {
    if (editingTooth && report) {
      const updatedTeethData = [...(report.teethData || []), editingTooth];
      setReport({
        ...report,
        teethData: updatedTeethData
      });
      setEditingTooth(null);
    }
  };

  const deleteTooth = (index: number) => {
    if (report && report.teethData) {
      const updatedTeethData = report.teethData.filter((_, i) => i !== index);
      setReport({
        ...report,
        teethData: updatedTeethData
      });
    }
  };

  const saveReport = async () => {
    if (!report) return;

    try {
      const response = await fetch(`/api/reports/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teethData: report.teethData,
          clinicalNotes: clinicalNotes,
          surgicalReportPDF: pdfPreview
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        alert('Rapor başarıyla güncellendi!');
      }
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Rapor güncellenirken hata oluştu!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const element = document.getElementById('report-content');
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Rapor - ${report?.patientName}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .section { margin-bottom: 20px; }
                .qr-code { text-align: center; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🏥 Cerrahi Rehber Raporu</h1>
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
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold text-lg inline-flex items-center space-x-3 transition-colors"
              >
                <Edit3 size={24} />
                <span>{isEditing ? '✅ Düzenlemeyi Bitir' : '✏️ Düzenle'}</span>
              </button>
              {isEditing && (
                <button
                  onClick={saveReport}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Save size={20} />
                  <span>Kaydet</span>
                </button>
              )}
              <button
                onClick={handleDownload}
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <Download size={20} />
                <span>İndir</span>
              </button>
              <button
                onClick={handlePrint}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Printer size={20} />
                <span>Yazdır</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Report Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Report Header */}
            <div id="report-content" className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-8 border-b pb-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">D</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Digimplant Solutions
                </h1>
                <h2 className="text-xl text-orange-600 font-semibold">
                  Cerrahi Rehber Raporu
                </h2>
                <p className="text-gray-600 mt-2">
                  Rapor Tarihi: {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>

              {/* Patient Information */}
              <div className="mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <User className="w-8 h-8 mr-3 text-orange-500" />
                  👤 Hasta Bilgileri
                </h3>
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200">
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    👤 Hasta Adı: {report.patientName}
                  </p>
                  <p className="text-xl text-gray-700">
                    📋 Rapor No: {report._id}
                  </p>
                </div>
              </div>
            </div>

            {/* Surgical Report PDF Upload */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-500" />
                Cerrahi Rapor (Exoplan/Atomica AI)
              </h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">PDF dosyasını yükleyin</p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="btn-primary cursor-pointer inline-flex items-center space-x-2"
                    >
                      <Upload size={20} />
                      <span>PDF Yükle</span>
                    </label>
                  </div>
                  {pdfFile && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800 font-medium">
                        ✓ {pdfFile.name} yüklendi
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {report.surgicalReportPDF ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-red-500" />
                          <div>
                            <p className="font-medium text-gray-900">Cerrahi Rapor.pdf</p>
                            <p className="text-sm text-gray-600">PDF dosyası mevcut</p>
                          </div>
                        </div>
                        <button className="btn-secondary inline-flex items-center space-x-2">
                          <Eye size={16} />
                          <span>Görüntüle</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Henüz PDF yüklenmemiş</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Teeth Data */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-8 h-8 mr-3 text-orange-500" />
                  🦷 Diş Bazlı İmplant Detayları
                </h3>
                {isEditing && (
                  <button
                    onClick={addTooth}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Diş Ekle</span>
                  </button>
                )}
              </div>

              {report.teethData && report.teethData.length > 0 ? (
                <div className="space-y-6">
                  {report.teethData.map((tooth, index) => (
                    <div key={index} className="border-2 border-orange-200 rounded-xl p-6 bg-gradient-to-r from-blue-50 to-blue-100">
                      <div className="flex justify-between items-start mb-6">
                        <h4 className="text-2xl font-bold text-gray-900">
                          🦷 Diş #{tooth.toothNumber}
                        </h4>
                        {isEditing && (
                          <button
                            onClick={() => deleteTooth(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-lg">
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <span className="font-bold text-gray-700 text-xl">🏷️ Marka:</span>
                          <p className="text-gray-900 text-xl font-semibold mt-1">{tooth.implantBrand}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <span className="font-bold text-gray-700 text-xl">🔧 Model:</span>
                          <p className="text-gray-900 text-xl font-semibold mt-1">{tooth.implantModel}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <span className="font-bold text-gray-700 text-xl">📏 Çap:</span>
                          <p className="text-gray-900 text-xl font-semibold mt-1">{tooth.implantDiameter} mm</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <span className="font-bold text-gray-700 text-xl">📐 Uzunluk:</span>
                          <p className="text-gray-900 text-xl font-semibold mt-1">{tooth.implantLength} mm</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <span className="font-bold text-gray-700 text-xl">🦴 Kemik Kalitesi:</span>
                          <p className="text-gray-900 text-xl font-semibold mt-1">{tooth.expectedBoneQuality}</p>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4 border-2 border-yellow-200 col-span-2 md:col-span-3">
                          <span className="font-bold text-gray-700 text-xl">⚙️ Önerilen Frez Protokolü:</span>
                          <p className="text-gray-900 text-lg font-semibold mt-2 whitespace-pre-wrap leading-relaxed">{tooth.recommendedDrillProtocol}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Henüz diş verisi eklenmemiş</p>
                  {isEditing && (
                    <button
                      onClick={addTooth}
                      className="btn-primary mt-4 inline-flex items-center space-x-2"
                    >
                      <Plus size={16} />
                      <span>İlk Dişi Ekle</span>
                    </button>
                  )}
                </div>
              )}

              {/* Add/Edit Tooth Modal */}
              {editingTooth && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Diş Bilgileri Ekle/Düzenle
                      </h3>
                      <button
                        onClick={() => setEditingTooth(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X size={20} />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Diş Numarası
                        </label>
                        <input
                          type="text"
                          value={editingTooth.toothNumber}
                          onChange={(e) => setEditingTooth({
                            ...editingTooth,
                            toothNumber: e.target.value
                          })}
                          className="form-input w-full"
                          placeholder="Örn: 16, 26, 36"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İmplant Markası
                        </label>
                        <input
                          type="text"
                          value={editingTooth.implantBrand}
                          onChange={(e) => setEditingTooth({
                            ...editingTooth,
                            implantBrand: e.target.value
                          })}
                          className="form-input w-full"
                          placeholder="Örn: Nobel, Straumann"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İmplant Modeli
                        </label>
                        <input
                          type="text"
                          value={editingTooth.implantModel}
                          onChange={(e) => setEditingTooth({
                            ...editingTooth,
                            implantModel: e.target.value
                          })}
                          className="form-input w-full"
                          placeholder="Örn: NobelActive, BLT"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İmplant Çapı (mm)
                        </label>
                        <input
                          type="text"
                          value={editingTooth.implantDiameter}
                          onChange={(e) => setEditingTooth({
                            ...editingTooth,
                            implantDiameter: e.target.value
                          })}
                          className="form-input w-full"
                          placeholder="Örn: 4.3, 5.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          İmplant Uzunluğu (mm)
                        </label>
                        <input
                          type="text"
                          value={editingTooth.implantLength}
                          onChange={(e) => setEditingTooth({
                            ...editingTooth,
                            implantLength: e.target.value
                          })}
                          className="form-input w-full"
                          placeholder="Örn: 10, 12, 14"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Beklenen Kemik Kalitesi
                        </label>
                        <select
                          value={editingTooth.expectedBoneQuality}
                          onChange={(e) => setEditingTooth({
                            ...editingTooth,
                            expectedBoneQuality: e.target.value
                          })}
                          className="form-select w-full"
                        >
                          <option value="">Seçiniz</option>
                          <option value="D1">D1 - Çok Sert</option>
                          <option value="D2">D2 - Sert</option>
                          <option value="D3">D3 - Orta</option>
                          <option value="D4">D4 - Yumuşak</option>
                          <option value="D1-D2">D1-D2</option>
                          <option value="D2-D3">D2-D3</option>
                          <option value="D3-D4">D3-D4</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Önerilen Frez Protokolü
                      </label>
                      <textarea
                        value={editingTooth.recommendedDrillProtocol}
                        onChange={(e) => setEditingTooth({
                          ...editingTooth,
                          recommendedDrillProtocol: e.target.value
                        })}
                        className="form-textarea w-full"
                        rows={3}
                        placeholder="Frez protokolü detaylarını yazın..."
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => setEditingTooth(null)}
                        className="btn-secondary"
                      >
                        İptal
                      </button>
                      <button
                        onClick={saveTooth}
                        className="btn-primary"
                      >
                        Kaydet
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clinical Notes */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Edit3 className="w-8 h-8 mr-3 text-orange-500" />
                📝 Cerrahın Klinik Notları
              </h3>
              
              {isEditing ? (
                <textarea
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full p-6 border-2 border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500 text-lg"
                  rows={8}
                  placeholder="Klinik notlarınızı buraya yazın..."
                />
              ) : (
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                  {clinicalNotes ? (
                    <p className="text-gray-900 whitespace-pre-wrap text-xl font-semibold leading-relaxed">{clinicalNotes}</p>
                  ) : (
                    <p className="text-gray-600 italic text-xl">Henüz klinik not eklenmemiş</p>
                  )}
                </div>
              )}
            </div>

            {/* QR Code */}
            {qrCodeDataUrl && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Dijital Rapor Erişimi
                </h3>
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto" />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  QR kodu tarayarak bu rapora mobil cihazınızdan erişebilirsiniz
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Report Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rapor Durumu
              </h3>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  report.status === 'approved' ? 'bg-green-500' :
                  report.status === 'reviewed' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <span className="text-gray-700 capitalize">
                  {report.status === 'approved' ? 'Onaylandı' :
                   report.status === 'reviewed' ? 'İncelendi' : 'Oluşturuldu'}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Hızlı İşlemler
              </h3>
              <div className="space-y-3">
                <button className="w-full btn-secondary text-left">
                  <Share2 className="w-4 h-4 mr-2 inline" />
                  Paylaş
                </button>
                <button className="w-full btn-secondary text-left">
                  <Calendar className="w-4 h-4 mr-2 inline" />
                  Takvime Ekle
                </button>
                <button className="w-full btn-secondary text-left">
                  <Mail className="w-4 h-4 mr-2 inline" />
                  E-posta Gönder
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                İletişim
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-orange-500" />
                  <span>+90 (212) 555 0123</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-orange-500" />
                  <span>info@digimplantsolutions.com</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 mr-2 text-orange-500 mt-0.5" />
                  <span>Maslak Mahallesi, Büyükdere Caddesi No: 123, Sarıyer/İstanbul</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <ChatInterface reportId={params.id as string} />
      )}
    </div>
  );
}