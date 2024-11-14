
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';
import Rewards from './components/Reward';
import Points from './components/Points';
import Item from './components/ItemManagement';
import AdminDashboard from './Admin';
import axios from 'axios';
import Signup from './components/Signup';
import './App.css';

import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  IconButton 
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Login Component
const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [adminList, setAdminList] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8083/api/users/getAllUsers')
      .then(response => setAdminList(response.data))
      .catch(error => console.error("Error fetching admin accounts:", error));
  }, []);

  const handleAccountSelect = (type) => {
    setSelectedType(type);
  };

  const handleSignup = () => {
    setIsSignupOpen(true);
  };

  const handleLogin = () => {
    setError('');
    
    const user = adminList.find(user => user.schoolEmail === credentials.email);
    if (!user) {
      setError('Email not found');
      return;
    }
    if (user.password !== credentials.password) {
      setError('Invalid password');
      return;
    }

    const userWithType = {
      ...user,
      accountType: selectedType
    };

    onLogin(userWithType);
    navigate(selectedType === 'admin' ? '/admin' : '/student/dashboard');
  };

  return (
    <div className="page-container">
      <Paper elevation={3} className="login-container">
        <Box className="content-wrapper">
          <Box className="left-side">
            <Box className="left-side-content">
              <Typography variant="h6" className="title">
                <strong>Choose Account Type</strong>
              </Typography>
              <Box className="account-types">
                <Box 
                  className={`account-option ${selectedType === 'admin' ? 'selected' : ''}`}
                  onClick={() => handleAccountSelect('admin')}
                >
                  <Box className="account-option-content">
                    <img src="admin.png" alt="Admin" className="account-icon" />
                    <Typography>Admin</Typography>
                  </Box>
                  {selectedType === 'admin' && (
                    <CheckCircleIcon className="check-icon" />
                  )}
                </Box>
                <Box 
                  className={`account-option ${selectedType === 'student' ? 'selected' : ''}`}
                  onClick={() => handleAccountSelect('student')}
                >
                  <Box className="account-option-content">
                    <img src="student.png" alt="Student" className="account-icon" />
                    <Typography>Student</Typography>
                  </Box>
                  {selectedType === 'student' && (
                    <CheckCircleIcon className="check-icon" />
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className="right-side">
            {selectedType && (
              <Box className="login-form">
                <Typography variant="h6" className="welcome-text">
                  <strong>Hello {selectedType === 'admin' ? 'Admin' : 'Student'}!</strong>
                </Typography>
                <Typography variant="subtitle1" className="login-subtitle">
                  Please Log in
                </Typography>
                
                <Box className="input-field">
                  <EmailIcon className="field-icon" />
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    className="text-field"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    required
                  />
                </Box>

                <Box className="input-field">
                  <LockIcon className="field-icon" />
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    className="text-field"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    required
                  />
                </Box>

                {error && (
                  <Box className="error-message">
                    <Typography color="error">{error}</Typography>
                  </Box>
                )}

                {selectedType === 'student' && (
                  <Box className="signup-text">
                    <Typography variant="body2">
                      No account? 
                      <Button 
                        color="primary" 
                        onClick={handleSignup}
                        className="signup-link"
                      >
                        Signup
                      </Button>
                    </Typography>
                  </Box>
                )}

                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  className="login-button"
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>
      
      <Signup 
        open={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
      />
    </div>
  );
};

// ProtectedRoute Component
const ProtectedRoute = ({ children, isAuthenticated, accountType, requiredType }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (accountType !== requiredType) {
      navigate(accountType === 'admin' ? '/admin' : '/student/dashboard');
    }
  }, [isAuthenticated, accountType, requiredType, navigate]);

  return isAuthenticated && accountType === requiredType ? children : null;
};

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('user');
    if (savedAuth && savedUser) {
      return true;
    }
    return false;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (userData) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to={user?.accountType === 'admin' ? '/admin' : '/student/dashboard'} />
            )
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              accountType={user?.accountType}
              requiredType="admin"
            >
              <AdminDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/*"
          element={
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              accountType={user?.accountType}
              requiredType="student"
            >
              <div className="dashboard">
      <header className="header">
        <img src="/citlogo.png" alt="University Logo" className="university-logo" />
        <input type="text" className="search-bar" placeholder="Search..." />
        <div className="user-profile">
                    <span className="user-name">{user?.schoolEmail.split('@')[0] || 'Guest'}</span>
                    <img src="/dilao.png" alt="User Profile" className="profile-picture" />
                  </div>
      </header>

      <div className="sidebar">
        <h2 className="header-dashboard">
          <span style={{ color: "#FFFDFC" }}>Found</span>
          <span style={{ color: "#F1D88A" }}>IT</span>
        </h2>
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <NavLink to="/student/dashboard" className="nav-link">📋 Dashboard</NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/student/rewards" className="nav-link">🎁 Rewards</NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/student/item" className="nav-link">📦 Found Or Lost Items here</NavLink>
          </li>
          <li className="sidebar-item">
            <button onClick={handleLogout} className="logout-button">🔓 Logout</button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/item" element={<Item />} />
        </Routes>
      </div>

      

              </div>
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route
          path="/"
          element={
            <Navigate to={
              !isAuthenticated 
                ? '/login' 
                : user?.accountType === 'admin'
                  ? '/admin'
                  : '/student/dashboard'
            } />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;