import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';
import UserDashboard from './components/user-Dashboard'
import Rewards from './components/Reward';
import Points from './components/Points';
import Item from './components/ItemManagement';
import AdminDashboard from './Admin';
import axios from 'axios';
import Signup from './components/Signup';
import './App.css';
import ClaimItem from './components/user-claimItem'
import UserRewards from './components/user-Reward'
import UserItem from './components/user-Item'
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
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


//icons
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PersonIcon from '@mui/icons-material/Person';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import InventoryIcon from '@mui/icons-material/Inventory';

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

    if (selectedType === 'admin' && !user.isAdmin) {
      setError('You do not have admin privileges');
      return;
    }

    const userWithType = {
      ...user,
      accountType: selectedType
    };

    onLogin(userWithType);
    navigate(selectedType === 'admin' ? '/admin' : '/student/dashboard');
  };

  const audioRef = useRef(null);

useEffect(() => {
  const audioElement = audioRef.current;
  
  const playAudio = () => {
    if (audioElement) {
      audioElement.play().catch(error => {
        console.log("Audio autoplay failed:", error);
      });
    }
  };

  playAudio();
  
  const handleInteraction = () => {
    playAudio();
    document.removeEventListener('click', handleInteraction);
  };
  document.addEventListener('click', handleInteraction);

  return () => {
    document.removeEventListener('click', handleInteraction);
    if (audioElement) {
      audioElement.pause();
    }
  };
}, []);

  return (
    <div className="page-container">
      <Paper elevation={3} className="login-container">
        <Box className="content-wrapper">
          <Box className="left-side">
            <video autoPlay muted loop playsInline>
              <source src="/CITCine.mp4" type="video/mp4" />
            </video>
            
            {/* Add audio element at the top level of your app */}
            <audio 
              ref={audioRef}
              loop 
              id="background-music"
            >
              <source src="/CITHymn.mp3" type="audio/mpeg" />
            </audio>
            
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

const ProtectedRoute = ({ children, isAuthenticated, accountType, requiredType }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (accountType !== requiredType) {
   
      if (accountType === 'admin' && requiredType === 'student') {
        return children;
      }
      navigate(accountType === 'admin' ? '/admin' : '/student/dashboard');
    }
  }, [isAuthenticated, accountType, requiredType, navigate]);

  if (accountType === 'admin' && requiredType === 'student') {
    return children;
  }

  return isAuthenticated && accountType === requiredType ? children : null;
};

function App() {
  const [passwordInput, setPasswordInput] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isViewProfileModal, setIsViewProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({
    schoolEmail: '',
    schoolId: '',
    password: '',
    bio: '',
  });
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    const savedUser = localStorage.getItem('user');
    return !!(savedAuth && savedUser);
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

  const handleProfileViewClick = () => {
    setIsViewProfileModal(true);
  };

  const handleDeactivateAccount = () => {
    setIsProfileModalOpen(false);
    setIsDeactivateModalOpen(true);
  };

  const confirmDeactivation = () => {
    if (passwordInput === user.password) {
      axios.delete(`http://localhost:8083/api/users/deleteUserDetails/${user.userID}`)
        .then(() => {
          handleLogout(); 
          alert("Account deactivated successfully.");
          navigate('/login');
        })
        .catch((error) => console.error("Error deactivating account:", error));
    } else {
      alert("Incorrect password. Please try again.");
    }
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

        <Route
        
          path="/admin/*"
          element={
            <div className="default-background">
            <ProtectedRoute 
              isAuthenticated={isAuthenticated} 
              accountType={user?.accountType}
              requiredType="admin"
            >
              <AdminDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute></div>
          }
        />

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

        <div className="user-profile" onClick={handleProfileViewClick}>
    <div className="user-info">
        <span className="user-name">{user?.schoolEmail.split('@')[0] || 'Guest'}</span>
        <span className="user-id">{user?.schoolId|| '00-0000-000'}</span>
    </div>
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
            <NavLink to="/student/dashboard" className="nav-link"><ContentPasteIcon style={{  color:'#dfb637',verticalAlign: 'middle', marginTop: '5px'}}/>&nbsp;&nbsp;&nbsp; Dashboard</NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/student/rewards" className="nav-link"><PersonIcon style={{  color:'#dfb637',verticalAlign: 'middle', marginTop: '5px'}}/>&nbsp;&nbsp;&nbsp; Rewards</NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/student/item" className="nav-link"><InventoryIcon style={{  color:'#dfb637',verticalAlign: 'middle', marginTop: '5px'}}/>&nbsp;&nbsp;&nbsp; Deposit Item</NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="/student/claim" className="nav-link"><SystemUpdateAltIcon style={{  color:'#dfb637',verticalAlign: 'middle', marginTop: '5px'}}/>&nbsp;&nbsp;&nbsp; Retrieve Item</NavLink>
          </li>
          <li className="sidebar-item">
            <button onClick={handleLogout} className="logout-button">🔓 Logout</button>
          </li>
        </ul>
      </div>
      
      <div className="main-content">
        <Routes>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/rewards" element={<UserRewards />} />
          <Route path="/item" element={<UserItem />} />
          <Route path="/claim" element={<ClaimItem/>}/>
        </Routes>
      </div>

      {isViewProfileModal && (
        <div className="modal-overlay2">
          <div className="modal-container2">
            <div className="content-header">
              <img src="/dilao.png" alt="User Profile" className="profile-picture" />
              <h2>Profile Information</h2>
            </div>
            <div className="profile-info">
              <p><strong>Email:</strong> {user.schoolEmail}</p>
              <p><strong>School ID:</strong> {user.schoolId}</p>
              <p><strong>Password:</strong> {user.password}</p>
              <p><strong>Bio:</strong> {user.bio}</p>
              <p><strong>Current Points:</strong> {user.currentPoints}</p>
            </div>
            <div className="button-group">
            <button onClick={() => setIsViewProfileModal(false)} className="cancel-button">Cancel</button>
           
            <button type="button" className="confirm-button" onClick={handleDeactivateAccount}>Deactivate Account</button>
            </div>
          </div>
        </div>
      )}


{isDeactivateModalOpen && (
        <div className="modal-overlay2">
          <div className="modal-container2">
            <h2>Confirm Deactivation</h2>
            <p>Enter your password to confirm account deactivation.</p>
            <input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <div className="button-group">
              <button onClick={confirmDeactivation} className="confirm-button">Confirm</button>
              <button 
                onClick={() => setIsDeactivateModalOpen(false)} 
                className="cancel-button" 
                style={{ backgroundColor: '#f44336', color: '#fff' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

              </div> 
            </ProtectedRoute>
          }
         
        />

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