import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';

const QRScanner = ({ onScanSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanning();
        },
        (errorMessage) => {
          // Handle scan errors silently
        }
      );
      
      setScanning(true);
      toast.success('Scanner started');
    } catch (error) {
      console.error('Error starting scanner:', error);
      toast.error('Could not start scanner');
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        setScanning(false);
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div id="qr-reader" className="w-full max-w-md mx-auto" />
      
      <div className="flex justify-center">
        {!scanning ? (
          <button
            onClick={startScanning}
            className="btn-primary"
          >
            Start Scanning
          </button>
        ) : (
          <button
            onClick={stopScanning}
            className="btn-danger"
          >
            Stop Scanning
          </button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;