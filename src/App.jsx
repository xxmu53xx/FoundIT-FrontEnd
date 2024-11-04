import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';
import Rewards from './components/Reward';
import Points from './components/Points';
import Item from './components/ItemManagement';
import './App.css';
import axios from 'axios';


const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [adminList, setAdminList] = useState([]);
//for login
  useEffect(() => {
    // Fetch admin accounts from backend
    //if wanna change it back to admin entity gali kay pde ra ni ibalik sa getAllUsers
    axios.get('http://localhost:8083/api/users/getAllUsers')
      .then(response => setAdminList(response.data))
      .catch(error => console.error("Error fetching admin accounts:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    //nya dre kay email rna dle schoolEmail
    //dayun users kay change to admin
    // Verify admin credentials
    const user = adminList.find(user => user.schoolEmail === credentials.email);
    if (!user) {
      setError('Email not found');
      return;
    }
    if (user.password !== credentials.password) {
      setError('Invalid password'); 
      return;
    }

    // Login successful
    onLogin(user);
  };
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(rgba(121, 41, 41, 0.7), rgba(121, 41, 41, 0.7)), url('/cit.png')`,
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.85)',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '320px',
        boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        textAlign: 'center',
        position: 'relative'
      }}>
        <h1 style={{
          color: '#7c2d2d',
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
        }}>Login</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              color: '#7c2d2d',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '0.3rem',
            }}>Username</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                backgroundColor: '#d3d3d3',
                color: '#333',
                fontSize: '14px',
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
            <label style={{
              display: 'block',
              color: '#7c2d2d',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '0.3rem',
            }}>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                backgroundColor: '#d3d3d3',
                color: '#333',
                fontSize: '14px',
              }}
              required
            />
          </div>
          {error && <div style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div>}
        </form>
      </div>
      <button 
        onClick={handleSubmit}
        style={{
          width: '150px',
          padding: '0.5rem',
          backgroundColor: '#fbbf24',
          border: 'none',
          borderRadius: '20px',
          color: '#7c2d2d',
          fontWeight: 'bold',
          fontSize: '16px',
          cursor: 'pointer',
          position: 'absolute',
          bottom: '170px', 
          marginTop: '1rem',
          transition: 'background-color 0.2s',
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#f5c842'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#fbbf24'}
      >
        Login
      </button>
    </div>
  );
};


const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? 
          <Login onLogin={handleLogin} /> : 
          <Navigate to="/" />
        } />
  
        <Route path="/*" element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <div className="dashboard">

              <header className="header">
                <img
                  src="/citlogo.png"
                  alt="University Logo"
                  className="university-logo"
                />
                <input
                  type="text"
                  className="search-bar"
                  placeholder="Search..."
                />
                <div className="user-profile">
                  <span className="user-name">Dilao</span>
                  <img 
                    src="/dilao.png" 
                    alt="User Profile"
                    className="profile-picture" 
                  />
                </div>
              </header>
  
              <div className="sidebar">
                <h2 className="header-dashboard">
                  <span style={{ color: "#FFFDFC" }}>Found</span>
                  <span style={{ color: "#F1D88A" }}>IT</span>
                </h2>
                <ul className="sidebar-menu">
                  <li className="sidebar-item">
                    <NavLink to="/" className="nav-link">
                      <span className="nav-icon">📋</span> Dashboard
                    </NavLink>
                  </li>
                  <li className="sidebar-item">
                    <NavLink to="/user-management" className="nav-link">
                      <span className="nav-icon">👥</span> User Management
                    </NavLink>
                  </li>
                  <li className="sidebar-item">
                    <NavLink to="/rewards" className="nav-link">
                      <span className="nav-icon">🎁</span> Rewards
                    </NavLink>
                  </li>
                  <li className="sidebar-item">
                    <NavLink to="/points" className="nav-link">
                      <span className="nav-icon">🍃</span> Points
                    </NavLink>
                  </li>
                  <li className="sidebar-item">
                    <NavLink to="/item" className="nav-link">
                      <span className="nav-icon">📦</span> Item
                    </NavLink>
                  </li>
                  <li className="sidebar-item">
                    <button 
                      onClick={handleLogout}
                      className="logout-button"
                    >
                      🔓 Logout
                    </button>
                  </li>
                </ul>
              </div>
  
             
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="/rewards" element={<Rewards />} />
                  <Route path="/points" element={<Points />} />
                  <Route path="/item" element={<Item />} />
                </Routes>
              
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;