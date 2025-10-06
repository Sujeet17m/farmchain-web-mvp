import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRScanner from '../../components/QRScanner';
import toast from 'react-hot-toast';

const ScanQR = () => {
  const navigate = useNavigate();
  const [manualInput, setManualInput] = useState('');

  const handleScanSuccess = (qrData) => {
    try {
      const data = JSON.parse(qrData);
      if (data.batchId) {
        navigate(`/consumer/product/${data.batchId}`);
      } else {
        toast.error('Invalid QR code');
      }
    } catch (error) {
      // Try direct batch ID
      navigate(`/consumer/product/${qrData}`);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      navigate(`/consumer/product/${manualInput.trim()}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Scan Product QR Code
        </h1>
        <p className="text-gray-600">
          Scan the QR code on your product to view its journey
        </p>
      </div>

      {/* QR Scanner */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Use Your Camera
        </h2>
        <QRScanner onScanSuccess={handleScanSuccess} />
      </div>

      {/* Manual Input */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Or Enter Batch ID Manually
        </h2>
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <input
            type="text"
            className="input-field"
            placeholder="Enter Batch ID..."
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
          />
          <button type="submit" className="btn-primary w-full">
            Track Product
          </button>
        </form>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-2">
          📱 How to Scan:
        </h3>
        <ul className="text-sm text-gray-700 space-y-2">
          <li>• Click "Start Scanning" to activate your camera</li>
          <li>• Point your camera at the QR code</li>
          <li>• Hold steady until the code is recognized</li>
          <li>• You'll be automatically redirected to the product details</li>
        </ul>
      </div>
    </div>
  );
};

export default ScanQR;