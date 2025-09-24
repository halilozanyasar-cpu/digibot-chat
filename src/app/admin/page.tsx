'use client';

import { useState, useEffect } from 'react';
import { 
  Download, 
  Eye, 
  FileText, 
  User, 
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Clock,
  Plus
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
  qrCode: string;
  reportUrl: string;
  status: string;
  createdAt: string;
  orderId: string;
  surgicalReportPDF?: string;
  teethData?: any[];
  clinicalNotes?: string;
}

export default function AdminPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCreatingSample, setIsCreatingSample] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'reviewed': return <Clock className="w-4 h-4" />;
      case 'pending': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const downloadPDF = (report: ReportData) => {
    if (report.surgicalReportPDF) {
      const link = document.createElement('a');
      link.href = report.surgicalReportPDF;
      link.download = `${report.patientName}_cerrahi_rapor.pdf`;
      link.click();
    }
  };

  const viewReport = (report: ReportData) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const deleteReport = async (reportId: string) => {
    if (confirm('Bu raporu silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/admin/reports/${reportId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setReports(reports.filter(r => r._id !== reportId));
        }
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const testAPI = async () => {
    try {
      const response = await fetch('/api/admin/test', {
        method: 'GET',
      });
      const data = await response.json();
      alert('Test API: ' + JSON.stringify(data));
    } catch (error) {
      console.error('Test API error:', error);
      alert('Test API hatası: ' + error.message);
    }
  };

  const createMockReport = async () => {
    setIsCreatingSample(true);
    try {
      const response = await fetch('/api/admin/create-mock-report', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        alert('Mock rapor oluşturuldu! Rapor sayfasına yönlendiriliyorsunuz...');
        // Mock raporu listeye ekle
        setReports(prev => [data.report, ...prev]);
        // Rapor sayfasına yönlendir
        window.open(data.reportUrl, '_blank');
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating mock report:', error);
      alert('Mock rapor oluşturulurken hata oluştu: ' + error.message);
    } finally {
      setIsCreatingSample(false);
    }
  };

  const createSampleReport = async () => {
    setIsCreatingSample(true);
    try {
      const response = await fetch('/api/admin/create-sample-report', {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok) {
        alert('Örnek rapor oluşturuldu!');
        fetchReports(); // Raporları yenile
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating sample report:', error);
      alert('Örnek rapor oluşturulurken hata oluştu: ' + error.message);
    } finally {
      setIsCreatingSample(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Raporlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
              <p className="text-gray-600">Tüm raporları yönetin ve dosyaları indirin</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Toplam: {reports.length} rapor
              </div>
              <button
                onClick={testAPI}
                className="btn-secondary inline-flex items-center space-x-2 mr-2"
              >
                <span>Test API</span>
              </button>
              <button
                onClick={createMockReport}
                disabled={isCreatingSample}
                className="btn-primary inline-flex items-center space-x-2 mr-2"
              >
                {isCreatingSample ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Mock Rapor Oluştur</span>
                  </>
                )}
              </button>
              <button
                onClick={createSampleReport}
                disabled={isCreatingSample}
                className="btn-secondary inline-flex items-center space-x-2"
              >
                {isCreatingSample ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Oluşturuluyor...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>DB Rapor Oluştur</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Hasta adı veya rapor ID'si ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10 w-full"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select w-full"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="reviewed">İncelendi</option>
                <option value="approved">Onaylandı</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hasta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İmplant Detayları
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PDF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-orange-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {report.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {report._id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {report.implantDetails.brand} {report.implantDetails.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {report.implantDetails.count} adet - {report.implantDetails.positions.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {getStatusIcon(report.status)}
                        <span className="ml-1">
                          {report.status === 'approved' ? 'Onaylandı' :
                           report.status === 'reviewed' ? 'İncelendi' : 'Beklemede'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(report.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {report.surgicalReportPDF ? (
                        <button
                          onClick={() => downloadPDF(report)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewReport(report)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => window.open(`/report/${report._id}`, '_blank')}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <FileText className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteReport(report._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredReports.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Rapor bulunamadı</h3>
            <p className="text-gray-600">Arama kriterlerinize uygun rapor bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Rapor Detayları - {selectedReport.patientName}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Patient Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Hasta Bilgileri</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><strong>Hasta Adı:</strong> {selectedReport.patientName}</p>
                  <p><strong>Rapor ID:</strong> {selectedReport._id}</p>
                  <p><strong>Oluşturulma Tarihi:</strong> {new Date(selectedReport.createdAt).toLocaleString('tr-TR')}</p>
                </div>
              </div>

              {/* Implant Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">İmplant Detayları</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p><strong>Marka:</strong> {selectedReport.implantDetails.brand}</p>
                  <p><strong>Model:</strong> {selectedReport.implantDetails.model}</p>
                  <p><strong>Sayı:</strong> {selectedReport.implantDetails.count} adet</p>
                  <p><strong>Pozisyonlar:</strong> {selectedReport.implantDetails.positions.join(', ')}</p>
                  <p><strong>Protez Tipi:</strong> {selectedReport.prosthesisType}</p>
                </div>
              </div>

              {/* Teeth Data */}
              {selectedReport.teethData && selectedReport.teethData.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Diş Bazlı Detaylar</h4>
                  <div className="space-y-3">
                    {selectedReport.teethData.map((tooth, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Diş #{tooth.toothNumber}</h5>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <p><strong>Marka:</strong> {tooth.implantBrand}</p>
                          <p><strong>Model:</strong> {tooth.implantModel}</p>
                          <p><strong>Çap:</strong> {tooth.implantDiameter} mm</p>
                          <p><strong>Uzunluk:</strong> {tooth.implantLength} mm</p>
                          <p><strong>Kemik Kalitesi:</strong> {tooth.expectedBoneQuality}</p>
                          <p><strong>Frez Protokolü:</strong> {tooth.recommendedDrillProtocol}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clinical Notes */}
              {selectedReport.clinicalNotes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Klinik Notlar</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap">{selectedReport.clinicalNotes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary"
                >
                  Kapat
                </button>
                <button
                  onClick={() => window.open(`/report/${selectedReport._id}`, '_blank')}
                  className="btn-primary"
                >
                  Raporu Görüntüle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
