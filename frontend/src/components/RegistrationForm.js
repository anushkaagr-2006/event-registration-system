import React, { useState } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import { FaDownload, FaCheckCircle, FaUserPlus } from 'react-icons/fa';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/register', formData);
      setRegistration(response.data.registration);
      setSuccess('Registration successful! Your QR code has been generated.');
      setFormData({ name: '', email: '' });
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
        if (err.response.data.registrationId) {
          setError(`${err.response.data.error} Your Registration ID: ${err.response.data.registrationId}`);
        }
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `${registration.registrationId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card">
        <h2 style={{ 
          textAlign: 'center', 
          color: '#667eea',
          marginBottom: '30px',
          fontSize: '28px'
        }}>
          <FaUserPlus style={{ marginRight: '10px' }} />
          Event Registration
        </h2>

        {!registration ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
              />
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <FaCheckCircle style={{ marginRight: '5px' }} />
                {success}
              </div>
            )}

            <button 
              type="submit" 
              className="btn" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? (
                <span>Registering...</span>
              ) : (
                <span>Register Now</span>
              )}
            </button>
          </form>
        ) : (
          <div className="registration-success">
            <div className="alert alert-success" style={{ textAlign: 'center' }}>
              <FaCheckCircle size={24} style={{ marginBottom: '10px' }} />
              <h3>Registration Successful!</h3>
            </div>

            <div style={{ 
              background: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '10px',
              marginBottom: '20px'
            }}>
              <p><strong>Name:</strong> {registration.name}</p>
              <p><strong>Email:</strong> {registration.email}</p>
              <p><strong>Registration ID:</strong> <span style={{ 
                color: '#667eea', 
                fontWeight: 'bold',
                fontSize: '18px'
              }}>{registration.registrationId}</span></p>
            </div>

            <div className="qr-code-container">
              <h4 style={{ marginBottom: '20px' }}>Your Event QR Code</h4>
              <div style={{ 
                background: 'white', 
                padding: '20px', 
                display: 'inline-block',
                borderRadius: '10px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
              }}>
                <QRCodeCanvas
  id="qr-code"
  value={JSON.stringify({
    registrationId: registration.registrationId,
    email: registration.email,
    name: registration.name
  })}
  size={200}
  level="H"
  includeMargin={true}
/>

              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={downloadQRCode} className="btn">
                  <FaDownload style={{ marginRight: '5px' }} />
                  Download QR Code
                </button>
                <button 
                  onClick={() => {
                    setRegistration(null);
                    setSuccess('');
                  }} 
                  className="btn btn-secondary"
                >
                  Register Another
                </button>
              </div>
            </div>

            <div className="alert alert-info" style={{ marginTop: '20px' }}>
              <strong>Important:</strong> Please save this QR code. You'll need it for event check-in.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;