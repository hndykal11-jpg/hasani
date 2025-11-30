import React, { useState } from 'react';
import { analyzeImageWithGemini } from '../services/geminiService';
import { Upload, ScanEye, FileImage, Loader2, RefreshCcw } from 'lucide-react';

const ImageAnalyzer: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysis(''); // Reset previous analysis
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    try {
      const result = await analyzeImageWithGemini(
        selectedImage,
        "Bu görseldeki ürünleri veya faturayı detaylıca analiz et. Ürün adı, markası ve varsa miktar/fiyat bilgilerini liste halinde çıkar. Türkçe yanıt ver."
      );
      setAnalysis(result);
    } catch (error) {
      console.error(error);
      setAnalysis("Görsel analiz edilirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setAnalysis('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-600">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ScanEye className="text-purple-600" />
          Görsel Analiz
        </h2>
        <p className="text-gray-600 mt-2">
          Ürün fotoğraflarını veya faturaları yükleyerek yapay zeka ile içerik analizi yapın.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className={`border-2 border-dashed rounded-xl h-80 flex flex-col items-center justify-center transition-colors ${selectedImage ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
            {selectedImage ? (
              <div className="relative w-full h-full p-4 group">
                <img src={selectedImage} alt="Analiz edilecek" className="w-full h-full object-contain" />
                <button 
                  onClick={reset}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-sm font-medium text-gray-600">Fotoğraf Yükle</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            )}
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={!selectedImage || isLoading}
            className="w-full py-3 bg-orange-600 text-white rounded-lg font-medium shadow hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" /> Analiz Ediliyor...
              </>
            ) : (
              <>
                <ScanEye /> Görseli Analiz Et
              </>
            )}
          </button>
        </div>

        {/* Result Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full min-h-[320px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
             <h3 className="font-semibold text-gray-800 flex items-center gap-2">
               <FileImage size={18} />
               Analiz Sonucu
             </h3>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
            {analysis ? (
              <div className="prose prose-sm prose-orange max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {analysis}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                {isLoading ? (
                  <div className="space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-400" />
                    <p>Yapay zeka görseli inceliyor...</p>
                  </div>
                ) : (
                  <>
                    <ScanEye className="w-12 h-12 mb-2 opacity-20" />
                    <p>Henüz bir analiz yapılmadı.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;