import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUserShield, 
  FaUsers, 
  FaUserCheck, 
  FaUserTimes,
  FaDownload,
  FaSync,
  FaTrash,
  FaEdit,
  FaChartLine
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [registrations, setRegistrations] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    attendanceRate: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      fetchRegistrations();
      // Auto-refresh every 10 seconds
      const interval = setInterval(fetchRegistrations, 10000);
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        password
      });
      
      const newToken = response.data.token;
      localStorage.setItem('adminToken', newToken);
      setToken(newToken);
      setIsAuthenticated(true);
      setPassword('');
    } catch (err) {
      setError('Invalid admin password');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    if (!token) return;

    try {
      const response = await axios.get('http://localhost:5000/api/admin/registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRegistrations(response.data.registrations);
      setStats(response.data.stats);
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout();
      }
      console.error('Error fetching registrations:', err);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/export/excel', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Error exporting to Excel');
    }
  };

  const toggleAttendance = async (id, currentStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/registration/${id}/attendance`,
        { isPresent: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRegistrations();
    } catch (err) {
      setError('Error updating attendance');
    }
  };

  const deleteRegistration = async (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/registration/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchRegistrations();
      } catch (err) {
        setError('Error deleting registration');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
    setIsAuthenticated(false);
    setRegistrations([]);
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  };

  const filteredRegistrations = registrations.filter(reg =>
    reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.registrationId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Prepare data for charts
  const pieData = [
    { name: 'Present', value: stats.present, color: '#28a745' },
    { name: 'Absent', value: stats.absent, color: '#dc3545' }
  ];

  const timelineData = registrations.reduce((acc, reg) => {
    const date = new Date(reg.registeredAt).toLocaleDateString();
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.registrations += 1;
      if (reg.isPresent) existing.present += 1;
    } else {
      acc.push({
        date,
        registrations: 1,
        present: reg.isPresent ? 1 : 0
      });
    }
    return acc;
  }, []).slice(-7); // Last 7 days

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <div className="card">
          <h2 style={{ 
            textAlign: 'center', 
            color: '#667eea',
            marginBottom: '30px',
            fontSize: '28px'
          }}>
            <FaUserShield style={{ marginRight: '10px' }} />
            Admin Login
          </h2>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter admin password"
              />
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="alert alert-info" style={{ marginTop: '20px' }}>
            <strong>Demo:</strong> Use password "admin123" to login
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h2 style={{ color: 'white', margin: 0 }}>
          <FaUserShield style={{ marginRight: '10px' }} />
          Admin Dashboard
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={fetchRegistrations} className="btn btn-secondary">
            <FaSync style={{ marginRight: '5px' }} />
            Refresh
          </button>
          <button onClick={handleExportExcel} className="btn btn-success">
            <FaDownload style={{ marginRight: '5px' }} />
            Export Excel
          </button>
          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <FaUsers size={30} style={{ marginBottom: '10px' }} />
          <h3>{stats.total}</h3>
          <p>Total Registrations</p>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
          <FaUserCheck size={30} style={{ marginBottom: '10px' }} />
          <h3>{stats.present}</h3>
          <p>Present</p>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)' }}>
          <FaUserTimes size={30} style={{ marginBottom: '10px' }} />
          <h3>{stats.absent}</h3>
          <p>Absent</p>
        </div>
        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)' }}>
          <FaChartLine size={30} style={{ marginBottom: '10px' }} />
          <h3>{stats.attendanceRate}%</h3>
          <p>Attendance Rate</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '20px', color: '#667eea' }}>Attendance Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '20px', color: '#667eea' }}>Registration Timeline</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="registrations" stroke="#667eea" name="Total" />
              <Line type="monotone" dataKey="present" stroke="#28a745" name="Present" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="card">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#667eea' }}>
            All Registrations ({filteredRegistrations.length})
          </h3>
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '5px',
              border: '2px solid #e0e0e0',
              width: '300px'
            }}
          />
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Registration ID</th>
                <th>Status</th>
                <th>Check-in Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((reg, index) => (
                <tr key={reg._id}>
                  <td>{index + 1}</td>
                  <td>{reg.name}</td>
                  <td>{reg.email}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {reg.registrationId}
                  </td>
                  <td>
                    <span className={`badge ${reg.isPresent ? 'badge-success' : 'badge-warning'}`}>
                      {reg.isPresent ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  <td>
                    {reg.checkInTime 
                      ? new Date(reg.checkInTime).toLocaleString() 
                      : 'Not checked in'}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleAttendance(reg._id, reg.isPresent)}
                      style={{
                        background: reg.isPresent ? '#dc3545' : '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '5px'
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => deleteRegistration(reg._id)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRegistrations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            {searchTerm ? 'No registrations found matching your search.' : 'No registrations yet.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;