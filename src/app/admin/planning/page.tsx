'use client';

import { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Send, 
  CheckCircle, 
  XCircle,
  Eye,
  Download,
  User,
  Calendar,
  DollarSign,
  Mail,
  Plus
} from 'lucide-react';

interface OrderData {
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
  status: string;
  createdAt: string;
  userEmail: string;
  userName: string;
  guidePrice?: number;
  sleevePrice?: number;
  totalAmount?: number;
}

export default function AdminPlanningPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [planningData, setPlanningData] = useState({
    surgicalReportPDFs: [] as File[],
    teethData: [] as any[],
    clinicalNotes: '',
    guidePrice: 0,
    sleevePrice: 0,
    totalAmount: 0,
    provisionAmount: 0
  });
  const [newOrderData, setNewOrderData] = useState({
    patientName: '',
    userEmail: 'halilozanyasar@gmail.com', // Gerçek email adresi
    userName: '',
    implantBrand: 'Nobel Biocare',
    implantModel: 'NobelActive',
    implantCount: 1,
    implantPositions: [''],
    prosthesisType: 'Tek diş kron'
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
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

  const startPlanning = (order: OrderData) => {
    setSelectedOrder(order);
    setPlanningData({
      surgicalReportPDFs: [],
      teethData: [],
      clinicalNotes: '',
      guidePrice: order.guidePrice || 0,
      sleevePrice: order.sleevePrice || 0,
      totalAmount: order.totalAmount || 0,
      provisionAmount: (order.totalAmount || 0) * 0.2 // %20 provizyon
    });
    setShowPlanningModal(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setPlanningData(prev => ({ 
        ...prev, 
        surgicalReportPDFs: [...prev.surgicalReportPDFs, ...newFiles] 
      }));
    }
  };

  const removeFile = (index: number) => {
    setPlanningData(prev => ({
      ...prev,
      surgicalReportPDFs: prev.surgicalReportPDFs.filter((_, i) => i !== index)
    }));
  };

  const addTooth = () => {
    setPlanningData(prev => ({
      ...prev,
      teethData: [...prev.teethData, {
        toothNumber: '',
        implantBrand: selectedOrder?.implantDetails.brand || '',
        implantModel: selectedOrder?.implantDetails.model || '',
        implantDiameter: '',
        implantLength: '',
        expectedBoneQuality: '',
        recommendedDrillProtocol: ''
      }]
    }));
  };

  const updateTooth = (index: number, field: string, value: string) => {
    setPlanningData(prev => ({
      ...prev,
      teethData: prev.teethData.map((tooth, i) => 
        i === index ? { ...tooth, [field]: value } : tooth
      )
    }));
  };

  const removeTooth = (index: number) => {
    setPlanningData(prev => ({
      ...prev,
      teethData: prev.teethData.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    const total = planningData.guidePrice + planningData.sleevePrice;
    const provision = total * 0.2;
    setPlanningData(prev => ({
      ...prev,
      totalAmount: total,
      provisionAmount: provision
    }));
  };

  const createMockOrder = async () => {
    // Validation
    if (!newOrderData.patientName.trim()) {
      alert('Lütfen hasta adını girin.');
      return;
    }
    if (!newOrderData.userName.trim()) {
      alert('Lütfen kullanıcı adını girin.');
      return;
    }
    if (!newOrderData.userEmail.trim()) {
      alert('Lütfen email adresini girin.');
      return;
    }
    if (!newOrderData.implantModel.trim()) {
      alert('Lütfen implant modelini girin.');
      return;
    }
    if (newOrderData.implantCount < 1) {
      alert('Lütfen en az 1 implant sayısı girin.');
      return;
    }

    // Filter empty positions
    const validPositions = newOrderData.implantPositions.filter(pos => pos.trim() !== '');
    if (validPositions.length === 0) {
      alert('Lütfen en az bir diş pozisyonu girin.');
      return;
    }

    setIsCreatingOrder(true);
    try {
      const orderData = {
        ...newOrderData,
        implantPositions: validPositions
      };

      const response = await fetch('/api/admin/create-mock-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Mock sipariş oluşturuldu!');
        setShowCreateOrderModal(false);
        setNewOrderData({
          patientName: '',
          userEmail: 'halilozanyasar@gmail.com', // Gerçek email adresi
          userName: '',
          implantBrand: 'Nobel Biocare',
          implantModel: 'NobelActive',
          implantCount: 1,
          implantPositions: [''],
          prosthesisType: 'Tek diş kron'
        });
        fetchOrders();
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating mock order:', error);
      alert('Mock sipariş oluşturulurken hata oluştu: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const submitPlanning = async () => {
    if (!selectedOrder) return;

    try {
      const formData = new FormData();
      formData.append('orderId', selectedOrder._id);
      formData.append('teethData', JSON.stringify(planningData.teethData));
      formData.append('clinicalNotes', planningData.clinicalNotes);
      formData.append('guidePrice', planningData.guidePrice.toString());
      formData.append('sleevePrice', planningData.sleevePrice.toString());
      formData.append('totalAmount', planningData.totalAmount.toString());
      formData.append('provisionAmount', planningData.provisionAmount.toString());
      
      // Birden fazla PDF dosyası ekle
      planningData.surgicalReportPDFs.forEach((file, index) => {
        formData.append(`surgicalReportPDF_${index}`, file);
      });
      formData.append('pdfCount', planningData.surgicalReportPDFs.length.toString());

      const response = await fetch('/api/admin/submit-planning', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        const reportId = data.reportId;
        const reportUrl = data.reportUrl;
        
        if (data.emailSent) {
          alert(`Planlama tamamlandı! Kullanıcıya email gönderildi.\n\nRapor ID: ${reportId}\nOnay Linki: ${reportUrl}`);
        } else {
          alert(`Planlama tamamlandı! (Email gönderilemedi - SMTP ayarları gerekli)\n\nRapor ID: ${reportId}\nOnay Linki: ${reportUrl}`);
        }
        
        // Console'a da yazdır
        console.log('Planlama tamamlandı!');
        console.log('Rapor ID:', reportId);
        console.log('Onay Linki:', reportUrl);
        console.log('Rapor Linki:', reportUrl);
        
        setShowPlanningModal(false);
        fetchOrders();
      } else {
        alert('Hata: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting planning:', error);
      alert('Planlama gönderilirken hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Siparişler yükleniyor...</p>
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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">🏥 Admin Planlama Paneli</h1>
              <p className="text-2xl text-orange-600 font-semibold">📋 Sipariş Planlama ve PDF Yükleme</p>
            </div>
            <div>
              <button
                onClick={() => setShowCreateOrderModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold text-lg inline-flex items-center space-x-3 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>📝 Mock Sipariş Oluştur</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-2xl font-bold text-gray-900">📋 Bekleyen Siparişler</h2>
          </div>
          
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
                    Kullanıcı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
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
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-orange-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {order.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {order._id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.implantDetails.brand} {order.implantDetails.model}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.implantDetails.count} adet - {order.implantDetails.positions.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.userName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'pending' ? 'Beklemede' :
                         order.status === 'planning' ? 'Planlanıyor' :
                         order.status === 'completed' ? 'Tamamlandı' : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => startPlanning(order)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold inline-flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Planla</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {orders.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bekleyen sipariş bulunamadı</h3>
            <p className="text-gray-600">Planlama bekleyen sipariş bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* Planning Modal */}
      {showPlanningModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                📋 Planlama - {selectedOrder.patientName}
              </h3>
              <button
                onClick={() => setShowPlanningModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Planning Form */}
              <div className="space-y-6">
                {/* PDF Upload */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📄 Exocad PDF'leri Yükle</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept=".pdf"
                      multiple
                      onChange={handleFileUpload}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Birden fazla PDF dosyası seçebilirsiniz
                    </p>
                    
                    {/* Yüklenen Dosyalar Listesi */}
                    {planningData.surgicalReportPDFs.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h5 className="font-medium text-gray-700">Yüklenen Dosyalar:</h5>
                        {planningData.surgicalReportPDFs.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600">📄</span>
                              <span className="text-sm text-gray-900">{file.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              ❌ Kaldır
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Teeth Data */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">🦷 Diş Detayları</h4>
                    <button
                      onClick={addTooth}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      + Diş Ekle
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {planningData.teethData.map((tooth, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">Diş #{index + 1}</h5>
                          <button
                            onClick={() => removeTooth(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Diş No"
                            value={tooth.toothNumber}
                            onChange={(e) => updateTooth(index, 'toothNumber', e.target.value)}
                            className="form-input text-sm"
                          />
                          <input
                            type="text"
                            placeholder="İmplant Markası"
                            value={tooth.implantBrand}
                            onChange={(e) => updateTooth(index, 'implantBrand', e.target.value)}
                            className="form-input text-sm"
                          />
                          <input
                            type="text"
                            placeholder="İmplant Modeli"
                            value={tooth.implantModel}
                            onChange={(e) => updateTooth(index, 'implantModel', e.target.value)}
                            className="form-input text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Çap (mm)"
                            value={tooth.implantDiameter}
                            onChange={(e) => updateTooth(index, 'implantDiameter', e.target.value)}
                            className="form-input text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Uzunluk (mm)"
                            value={tooth.implantLength}
                            onChange={(e) => updateTooth(index, 'implantLength', e.target.value)}
                            className="form-input text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Kemik Kalitesi"
                            value={tooth.expectedBoneQuality}
                            onChange={(e) => updateTooth(index, 'expectedBoneQuality', e.target.value)}
                            className="form-input text-sm"
                          />
                        </div>
                        <textarea
                          placeholder="Frez Protokolü"
                          value={tooth.recommendedDrillProtocol}
                          onChange={(e) => updateTooth(index, 'recommendedDrillProtocol', e.target.value)}
                          className="form-textarea text-sm mt-2"
                          rows={2}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Clinical Notes */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📝 Klinik Notlar</h4>
                  <textarea
                    value={planningData.clinicalNotes}
                    onChange={(e) => setPlanningData(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                    className="form-textarea w-full"
                    rows={4}
                    placeholder="Klinik notlarınızı yazın..."
                  />
                </div>
              </div>

              {/* Right Column - Order Details & Pricing */}
              <div className="space-y-6">
                {/* Order Summary */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📋 Sipariş Özeti</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">👤 Hasta:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.patientName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">🏷️ İmplant Markası:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.implantDetails.brand}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">🔧 İmplant Modeli:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.implantDetails.model}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">📊 İmplant Sayısı:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.implantDetails.count} adet</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">📍 Diş Pozisyonları:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.implantDetails.positions.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">🦷 Protez Tipi:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.prosthesisType}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">👨‍⚕️ Kullanıcı:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.userName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">📧 Email:</span>
                      <span className="ml-2 text-gray-900">{selectedOrder.userEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">💰 Fiyatlandırma</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rehber Ücreti</label>
                      <input
                        type="number"
                        value={planningData.guidePrice}
                        onChange={(e) => setPlanningData(prev => ({ ...prev, guidePrice: Number(e.target.value) }))}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sleeve Ücreti</label>
                      <input
                        type="number"
                        value={planningData.sleevePrice}
                        onChange={(e) => setPlanningData(prev => ({ ...prev, sleevePrice: Number(e.target.value) }))}
                        className="form-input"
                      />
                    </div>
                    <button
                      onClick={calculateTotal}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Toplam Hesapla
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">📊 Özet</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Rehber Ücreti:</span>
                      <span className="font-semibold">₺{planningData.guidePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sleeve Ücreti:</span>
                      <span className="font-semibold">₺{planningData.sleevePrice}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Toplam:</span>
                      <span className="font-bold text-lg">₺{planningData.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>Provizyon (%20):</span>
                      <span className="font-bold">₺{planningData.provisionAmount}</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={submitPlanning}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold text-lg inline-flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>📧 Planlamayı Gönder ve Email At</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Mock Order Modal */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                📝 Mock Sipariş Oluştur
              </h3>
              <button
                onClick={() => setShowCreateOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Patient Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">👤 Hasta Adı</label>
                <input
                  type="text"
                  value={newOrderData.patientName}
                  onChange={(e) => setNewOrderData(prev => ({ ...prev, patientName: e.target.value }))}
                  className="form-input w-full"
                  placeholder="Hasta adını girin"
                />
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">👨‍⚕️ Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={newOrderData.userName}
                    onChange={(e) => setNewOrderData(prev => ({ ...prev, userName: e.target.value }))}
                    className="form-input w-full"
                    placeholder="Kullanıcı adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📧 Email</label>
                  <input
                    type="email"
                    value={newOrderData.userEmail}
                    onChange={(e) => setNewOrderData(prev => ({ ...prev, userEmail: e.target.value }))}
                    className="form-input w-full"
                    placeholder="kullanici@email.com"
                  />
                </div>
              </div>

              {/* Implant Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🏷️ İmplant Markası</label>
                  <select
                    value={newOrderData.implantBrand}
                    onChange={(e) => setNewOrderData(prev => ({ ...prev, implantBrand: e.target.value }))}
                    className="form-select w-full"
                  >
                    <option value="Nobel Biocare">Nobel Biocare</option>
                    <option value="Straumann">Straumann</option>
                    <option value="Anthogyr">Anthogyr</option>
                    <option value="Dentsply">Dentsply</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🔧 İmplant Modeli</label>
                  <input
                    type="text"
                    value={newOrderData.implantModel}
                    onChange={(e) => setNewOrderData(prev => ({ ...prev, implantModel: e.target.value }))}
                    className="form-input w-full"
                    placeholder="NobelActive"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">📊 İmplant Sayısı</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newOrderData.implantCount}
                    onChange={(e) => setNewOrderData(prev => ({ ...prev, implantCount: Number(e.target.value) }))}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">🦷 Protez Tipi</label>
                  <select
                    value={newOrderData.prosthesisType}
                    onChange={(e) => setNewOrderData(prev => ({ ...prev, prosthesisType: e.target.value }))}
                    className="form-select w-full"
                  >
                    <option value="Tek diş kron">Tek diş kron</option>
                    <option value="Köprü">Köprü</option>
                    <option value="Hibrit protez">Hibrit protez</option>
                    <option value="Tam protez">Tam protez</option>
                  </select>
                </div>
              </div>

              {/* Implant Positions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📍 Diş Pozisyonları</label>
                <div className="space-y-2">
                  {Array.from({ length: newOrderData.implantCount }, (_, index) => (
                    <input
                      key={index}
                      type="text"
                      value={newOrderData.implantPositions[index] || ''}
                      onChange={(e) => {
                        const newPositions = [...newOrderData.implantPositions];
                        newPositions[index] = e.target.value;
                        setNewOrderData(prev => ({ ...prev, implantPositions: newPositions }));
                      }}
                      className="form-input w-full"
                      placeholder={`Diş ${index + 1} pozisyonu (örn: 16, 26)`}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowCreateOrderModal(false)}
                  className="btn-secondary"
                >
                  İptal
                </button>
                <button
                  onClick={createMockOrder}
                  disabled={isCreatingOrder}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-semibold inline-flex items-center space-x-2 disabled:opacity-50"
                >
                  {isCreatingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Oluşturuluyor...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Mock Sipariş Oluştur</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
