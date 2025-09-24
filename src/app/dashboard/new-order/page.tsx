'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  X, 
  ArrowLeft, 
  Save,
  CreditCard,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface OrderForm {
  patientName: string;
  implantBrand: string;
  implantModel: string;
  implantCount: number;
  implantPositions: string[];
  prosthesisType: 'hibrit' | 'köprü' | 'tek_kron' | 'diğer';
  notes: string;
}

const implantBrands = [
  'Nobel Biocare',
  'Straumann',
  'Dentsply Sirona',
  'Zimmer Biomet',
  'MegaGen',
  'Osstem',
  'Diğer'
];

const prosthesisTypes = [
  { value: 'hibrit', label: 'Hibrit Protez' },
  { value: 'köprü', label: 'Köprü' },
  { value: 'tek_kron', label: 'Tek Kron' },
  { value: 'diğer', label: 'Diğer' }
];

// Simplified jaw diagram positions
const jawPositions = [
  '11', '12', '13', '14', '15', '16', '17', '18',
  '21', '22', '23', '24', '25', '26', '27', '28',
  '31', '32', '33', '34', '35', '36', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48'
];

export default function NewOrderPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [stlFiles, setStlFiles] = useState<File[]>([]);
  const [dicomFiles, setDicomFiles] = useState<File[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderForm>();

  const implantCount = watch('implantCount') || 0;

  const onStlDrop = (acceptedFiles: File[]) => {
    setStlFiles(prev => [...prev, ...acceptedFiles]);
  };

  const onDicomDrop = (acceptedFiles: File[]) => {
    setDicomFiles(prev => [...prev, ...acceptedFiles]);
  };

  const removeStlFile = (index: number) => {
    setStlFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeDicomFile = (index: number) => {
    setDicomFiles(prev => prev.filter((_, i) => i !== index));
  };

  const togglePosition = (position: string) => {
    setSelectedPositions(prev => {
      if (prev.includes(position)) {
        return prev.filter(p => p !== position);
      } else {
        if (prev.length < implantCount) {
          return [...prev, position];
        }
        return prev;
      }
    });
  };

  const onSubmit = async (data: OrderForm) => {
    if (selectedPositions.length !== implantCount) {
      alert('İmplant sayısı ile seçilen pozisyon sayısı eşleşmiyor.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('patientName', data.patientName);
      formData.append('implantBrand', data.implantBrand);
      formData.append('implantModel', data.implantModel);
      formData.append('implantCount', data.implantCount.toString());
      formData.append('implantPositions', JSON.stringify(selectedPositions));
      formData.append('prosthesisType', data.prosthesisType);
      formData.append('notes', data.notes || '');

      stlFiles.forEach((file, index) => {
        formData.append(`stlFile_${index}`, file);
      });

      dicomFiles.forEach((file, index) => {
        formData.append(`dicomFile_${index}`, file);
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        router.push(`/dashboard/orders/${result.orderId}`);
      } else {
        alert(result.message || 'Sipariş oluşturulurken bir hata oluştu.');
      }
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Yeni Sipariş</h1>
              <p className="text-gray-600">Cerrahi rehber siparişi oluşturun</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Patient Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-orange-500" />
              Hasta Bilgileri
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasta Adı *
                </label>
                <input
                  {...register('patientName', { required: 'Hasta adı gereklidir' })}
                  type="text"
                  className="form-input"
                  placeholder="Hasta adını girin"
                />
                {errors.patientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İmplant Sayısı *
                </label>
                <input
                  {...register('implantCount', { 
                    required: 'İmplant sayısı gereklidir',
                    min: { value: 1, message: 'En az 1 implant olmalıdır' }
                  })}
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="1"
                />
                {errors.implantCount && (
                  <p className="mt-1 text-sm text-red-600">{errors.implantCount.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Implant Information */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              İmplant Bilgileri
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İmplant Markası *
                </label>
                <select
                  {...register('implantBrand', { required: 'İmplant markası gereklidir' })}
                  className="form-input"
                >
                  <option value="">Marka seçin</option>
                  {implantBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                {errors.implantBrand && (
                  <p className="mt-1 text-sm text-red-600">{errors.implantBrand.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İmplant Modeli *
                </label>
                <input
                  {...register('implantModel', { required: 'İmplant modeli gereklidir' })}
                  type="text"
                  className="form-input"
                  placeholder="Model adını girin"
                />
                {errors.implantModel && (
                  <p className="mt-1 text-sm text-red-600">{errors.implantModel.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protez Tipi *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {prosthesisTypes.map(type => (
                  <label key={type.value} className="flex items-center">
                    <input
                      {...register('prosthesisType', { required: 'Protez tipi gereklidir' })}
                      type="radio"
                      value={type.value}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{type.label}</span>
                  </label>
                ))}
              </div>
              {errors.prosthesisType && (
                <p className="mt-1 text-sm text-red-600">{errors.prosthesisType.message}</p>
              )}
            </div>
          </div>

          {/* Implant Positions */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              İmplant Pozisyonları ({selectedPositions.length}/{implantCount})
            </h2>
            
            <div className="grid grid-cols-8 gap-2">
              {jawPositions.map(position => (
                <button
                  key={position}
                  type="button"
                  onClick={() => togglePosition(position)}
                  disabled={!selectedPositions.includes(position) && selectedPositions.length >= implantCount}
                  className={`p-3 text-sm font-medium rounded-lg border-2 transition-colors ${
                    selectedPositions.includes(position)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300'
                  } ${
                    !selectedPositions.includes(position) && selectedPositions.length >= implantCount
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }`}
                >
                  {position}
                </button>
              ))}
            </div>
          </div>

          {/* File Uploads */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Dosya Yüklemeleri
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* STL Files */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  STL Dosyaları (Ağız İçi Tarama)
                </label>
                <FileDropzone
                  onDrop={onStlDrop}
                  accept={{ 'application/octet-stream': ['.stl'] }}
                  files={stlFiles}
                  onRemove={removeStlFile}
                />
              </div>

              {/* DICOM Files */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DICOM Dosyaları (Tomografi)
                </label>
                <FileDropzone
                  onDrop={onDicomDrop}
                  accept={{ 'application/dicom': ['.dcm', '.dicom'] }}
                  files={dicomFiles}
                  onRemove={removeDicomFile}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Notlar
            </h2>
            
            <textarea
              {...register('notes')}
              rows={4}
              className="form-input"
              placeholder="Ek notlarınızı buraya yazabilirsiniz..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Kaydediliyor...' : 'Siparişi Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// File Dropzone Component
function FileDropzone({ onDrop, accept, files, onRemove }: {
  onDrop: (files: File[]) => void;
  accept: any;
  files: File[];
  onRemove: (index: number) => void;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: true,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">
          {isDragActive ? 'Dosyaları buraya bırakın' : 'Dosyaları sürükleyin veya tıklayın'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          STL, DICOM dosyaları kabul edilir
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
