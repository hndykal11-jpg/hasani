import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Small timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        if (!document.getElementById('reader')) return;

        scannerRef.current = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true
          },
          /* verbose= */ false
        );

        scannerRef.current.render(
          (decodedText) => {
            onScanSuccess(decodedText);
            onClose(); // Auto close on success
          },
          (errorMessage) => {
            // Ignore scan errors as they happen constantly when no code is in view
          }
        );
      } catch (err) {
        console.error("Scanner initialization error:", err);
        setError("Kamera başlatılamadı. Lütfen izinleri kontrol edin.");
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(console.error);
        } catch (e) {
          console.error("Error clearing scanner", e);
        }
      }
    };
  }, [onScanSuccess, onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Camera className="text-orange-600" size={20} />
            Barkod Tara
          </h3>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 bg-black">
           {error ? (
             <div className="text-white text-center p-8">
               <p className="text-red-400 mb-2">{error}</p>
               <button onClick={onClose} className="text-sm underline">Kapat</button>
             </div>
           ) : (
             <div id="reader" className="w-full overflow-hidden rounded-lg bg-gray-900"></div>
           )}
        </div>
        
        <div className="p-4 bg-white text-center">
          <p className="text-sm text-gray-500">Barkodu karenin içine getirin.</p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;