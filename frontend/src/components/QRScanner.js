import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { FaQrcode, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [checkInHistory, setCheckInHistory] = useState([]);

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner('qr-reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(onScanSuccess, onScanError);

      return () => {
        scanner.clear().catch(error => {
          console.error('Failed to clear scanner:', error);
        });
      };
    }
  }, [isScanning]);

  const onScanSuccess = async (decodedText) => {
    setIsScanning(false);
    setScanError('');
    
    try {
      // Parse the QR code data
      const qrData = JSON.parse(decodedText);
      
      // Send to backend to mark attendance
      const response = await axios.post('http://localhost:5000/api/attendance/scan', {
        registrationId: qrData.registrationId
      });

      setScanResult({
        success: true,
        data: response.data.participant,
        message: response.data.message
      });

      // Add to check-in history
      setCheckInHistory(prev => [{
        ...response.data.participant,
        time: new Date().toLocaleTimeString()
      }, ...prev]);

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setScanResult(null);
        setIsScanning(true);
      }, 3000);

    } catch (error) {
      if (error.response?.data?.error) {
        setScanResult({
          success: false,
          message: error.response.data.error,
          data: error.response.data
        });
      } else {
        setScanResult({
          success: false,
          message: 'Invalid QR Code or scanning error'
        });
      }

      // Auto-reset after 3 seconds
      setTimeout(() => {
        setScanResult(null);
        setIsScanning(true);
      }, 3000);
    }
  };

  const onScanError = (error) => {
    // Silently handle scan errors (these occur frequently when camera is searching)
    console.warn(error);
  };

  const resetScanner = () => {
    setScanResult(null);
    setScanError('');
    setIsScanning(true);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ 
          textAlign: 'center', 
          color: '#667eea',
          marginBottom: '30px',
          fontSize: '28px'
        }}>
          <FaQrcode style={{ marginRight: '10px' }} />
          QR Code Scanner
        </h2>

        {isScanning && (
          <div>
            <div id="qr-reader" style={{ width: '100%' }}></div>
            <div className="alert alert-info" style={{ marginTop: '20px' }}>
              <strong>Instructions:</strong> Hold the QR code steady within the frame to scan
            </div>
          </div>
        )}

        {scanResult && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            {scanResult.success ? (
              <div>
                <FaCheckCircle size={80} color="#28a745" />
                <h3 style={{ color: '#28a745', margin: '20px 0' }}>
                  {scanResult.message}
                </h3>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '20px', 
                  borderRadius: '10px',
                  textAlign: 'left',
                  maxWidth: '400px',
                  margin: '0 auto'
                }}>
                  <p><strong>Name:</strong> {scanResult.data.name}</p>
                  <p><strong>Email:</strong> {scanResult.data.email}</p>
                  <p><strong>Registration ID:</strong> {scanResult.data.registrationId}</p>
                  <p><strong>Check-in Time:</strong> {new Date(scanResult.data.checkInTime).toLocaleString()}</p>
                </div>
              </div>
            ) : (
              <div>
                <FaTimesCircle size={80} color="#dc3545" />
                <h3 style={{ color: '#dc3545', margin: '20px 0' }}>
                  {scanResult.message}
                </h3>
                {scanResult.data?.name && (
                  <div style={{ 
                    background: '#f8f9fa', 
                    padding: '20px', 
                    borderRadius: '10px',
                    textAlign: 'left',
                    maxWidth: '400px',
                    margin: '0 auto'
                  }}>
                    <p><strong>Name:</strong> {scanResult.data.name}</p>
                    <p><strong>Already checked in at:</strong> {new Date(scanResult.data.checkInTime).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}
            <button onClick={resetScanner} className="btn" style={{ marginTop: '20px' }}>
              Scan Another QR Code
            </button>
          </div>
        )}

        {scanError && (
          <div className="alert alert-error">
            {scanError}
          </div>
        )}
      </div>

      {checkInHistory.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <h3 style={{ marginBottom: '20px', color: '#667eea' }}>
            <FaClock style={{ marginRight: '10px' }} />
            Recent Check-ins ({checkInHistory.length})
          </h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Registration ID</th>
                </tr>
              </thead>
              <tbody>
                {checkInHistory.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.time}</td>
                    <td>{entry.name}</td>
                    <td>{entry.email}</td>
                    <td>{entry.registrationId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;