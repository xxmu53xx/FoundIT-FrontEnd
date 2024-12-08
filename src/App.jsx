import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';
import UserDashboard from './components/user-Dashboard'
import Rewards from './components/Reward';
import Points from './components/Points';
import Item from './components/ItemManagement';
import AdminDashboard from './Admin';
import './components/sidebar.css';

import UserPosts from './components/user-post'
import axios from 'axios';
import Signup from './components/Signup';
import './App.css';
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
import StarsIcon from '@mui/icons-material/Stars';
import LogoutIcon from '@mui/icons-material/Logout';

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
                    <img src="newadmin.png" alt="Admin" className="account-icon" />
                    <Typography><strong>Admin</strong></Typography>
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
                    <img src="newstudent.png" alt="Student" className="account-icon" />
                    <Typography><strong>Student</strong></Typography>
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






/*
const renderItemImage = (item) => {
  if (item.image) {
    return (
      <img
        src={item.image}
        alt="Item"
        style={{
          width: '250px',
          height: '300px',
          objectFit: 'cover',
          borderRadius: '4px',
          border: '1px solid #ddd',
          cursor: 'pointer'
        }}
        onClick={() => handleZoomImage(item.image)}
        onError={(e) => {
          console.error(`Image load error for item ${item.itemID}`);
          e.target.style.display = 'none';
        }}
      />
    );
  }
  return (
    <div style={{
      width: '420px',
      height: '300px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      display: 'flex',
      maxWidth: '250px',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid #ddd',
      color: '#666',
      fontSize: '12px',
      textAlign: 'center'
    }}>
      No Image
    </div>
  );
};*/
function App() {
  const [passwordInput, setPasswordInput] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isViewProfileModal, setIsViewProfileModal] = useState(false);
  const [isEditProfileModal, setIsEditProfileModal] = useState(false);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({
    schoolEmail: '',
    schoolId: '',
    password: '',
    bio: '',
  });
  const [editProfileData, setEditProfileData] = useState({
    schoolEmail: '',
    schoolId: '',
    password: '',
    bio: '',
    image: ''
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

  useEffect(() => {
    if (user) {
      setEditProfileData({
        schoolEmail: user.schoolEmail,
        schoolId: user.schoolId,
        password: user.password,
        bio: user.bio || '',
      });
    }
  }, [user]);

  useEffect(() => {
    const handlePointsUpdate = (event) => {
      // Update the user's points in localStorage and state
      const updatedUser = {
        ...user,
        currentPoints: event.detail.newPoints
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    };

    // Add event listener
    window.addEventListener('userPointsUpdated', handlePointsUpdate);

    // Cleanup listener
    return () => {
      window.removeEventListener('userPointsUpdated', handlePointsUpdate);
    };
  }, [user]);

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

  const handleEditProfile = () => {
    setIsViewProfileModal(false);
    setIsEditProfileModal(true);
  };

  const handleSaveProfile = () => {
    axios.put(`http://localhost:8083/api/users/putUserDetails/${user.userID}`, editProfileData)
      .then(response => {
        const updatedUser = { ...user, ...editProfileData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditProfileModal(false);
        setIsViewProfileModal(true);
        alert('Profile updated successfully!');
      })
      .catch(error => {
        console.error("Error updating profile:", error);
        alert('Failed to update profile. Please try again.');
      });
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


  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setError('File is too large. Please choose an image under 5MB.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfileData(prev => ({
          ...prev,
          image: reader.result
        }));
        setError(null);
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsDataURL(file);
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
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              accountType={user?.accountType}
              requiredType="admin"
            >
              <AdminDashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
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
                  <NavLink to="/student/dashboard" className="nav-item">
                    <img src="/citlogo.png" alt="University Logo" className="university-logo" /></NavLink>
                  <div className="user-profile" onClick={handleProfileViewClick}>
                    <div className="user-info">
                      <span className="user-name">{user?.schoolEmail.split('@')[0] || 'Guest'}</span>
                      <span className="user-id">{user?.schoolId || '00-0000-000'}</span>
                      <spam className="curPoints">{new Intl.NumberFormat().format(user?.currentPoints)} CP</spam>
                    </div>
                    {user ? (
                      <img
                        src={user.image || "/NullPFP.png"}
                        alt="User Profile"
                        className="profile-picture"
                      />
                    ) : (
                      <img
                        src="/NullPFP.png"
                        alt="Default Profile"
                        className="profile-picture"
                      />
                    )}
                  </div>
                </header>

                <div className="modern-sidebar">
                  <div className="sidebar-brand">
                    <span className="found">Found</span>
                    <span className="it">IT</span>
                    <span className="admin">Student</span>
                  </div>

                  <div className="nav-links">
                    <NavLink to="/student/dashboard" className="nav-item">
                      <ContentPasteIcon style={{ color: '#dfb637', fontSize: 24 }} />
                      <span className="nav-label">Dashboard</span>
                    </NavLink>

                    <NavLink to="/student/rewards" className="nav-item">
                      <StarsIcon style={{ color: '#dfb637', fontSize: 24 }} />
                      <span className="nav-label">Rewards</span>
                    </NavLink>

                    <NavLink to="/student/item" className="nav-item">
                      <InventoryIcon style={{ color: '#dfb637', fontSize: 24 }} />
                      <span className="nav-label">Deposit/Retrieve Items</span>
                    </NavLink>

                    <NavLink to="/student/posts" className="nav-item">
                      <SystemUpdateAltIcon style={{ color: '#dfb637', fontSize: 24 }} />
                      <span className="nav-label">Your Posts</span>
                    </NavLink>
                  </div>

                  <button onClick={handleLogout} className="logout-item">
                    <LogoutIcon style={{ color: '#dfb637', fontSize: 24 }} />
                    <span className="nav-label">Logout</span>
                  </button>
                </div>

                <div className="main-content">
                  <Routes>
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/rewards" element={<UserRewards />} />
                    <Route path="/item" element={<UserItem user={user} />} />
                    <Route path="/posts" element={<UserPosts user={user} />} />
                  </Routes>
                </div>

                {isViewProfileModal && (
                  <div className="modal-overlay">
                    <div className="modal-container">
                      <div className="content1-header"></div>

                      <div className="profile-body">
                        <div className="profile-left">
                          <div style={{ position: 'relative', display: 'inline-block' }}>
                            <label htmlFor="profile-picture-upload">
                              <img
                                src={user.image || "/NullPFP.png"}
                                alt="User Profile"
                                className="profile-picture1"
                                style={{
                                  width: '90px',
                                  height: '90px',
                                  borderRadius: '50%',
                                  objectFit: 'cover',
                                  border: '2px solid #ddd',
                                }}
                              />
                            </label>
                            <input
                              type="file"
                              id="profile-picture-upload"
                              style={{ display: 'none' }}
                              onChange={handleImageUpload}
                            />
                          </div>
                          <div className="about-me">
                            <h3>Bio</h3>
                            <p>{user.bio}</p>
                          </div>
                        </div>

                        <div className="profile-right">
                          <p><strong>Email:</strong> {user.schoolEmail}</p>
                          <p><strong>School ID:</strong> {user.schoolId}</p>
                          <p><strong>Password:</strong> {user.password}</p>
                          <p><strong>Current Points:</strong> {user.currentPoints}</p>
                        </div>
                      </div>

                      <div className="button-group">
                        <button onClick={() => setIsViewProfileModal(false)} className="cancel-button">Cancel</button>
                        <button onClick={handleEditProfile} className="edit-button">Edit Profile</button>
                        <button type="button" className="confirm-button" onClick={handleDeactivateAccount}>Deactivate Account</button>
                      </div>
                    </div>
                  </div>
                )}

                {isEditProfileModal && (
                  <div className="modal-overlay">
                    <div className="modal-container">
                      <div className="content1-header">
                        <h2>Edit Profile</h2>
                      </div>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <label htmlFor="profile-picture-upload" style={{ cursor: 'pointer' }}>
                          <img
                            src={user.image || "/NullPFP.png"}
                            alt="User Profile"
                            className="profile-picture1"
                            style={{
                              width: '90px',
                              height: '90px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #ddd',
                            }}
                          />
                        </label>
                        <input
                          type="file"
                          id="profile-picture-upload"
                          style={{ display: 'none' }}
                          onChange={handleImageUpload}
                        />
                      </div>
                      <div className="profile-body">
                        <div className="profile-form">
                          <div className="form-group">
                            <label>Email:</label>
                            <input
                              type="email"
                              value={editProfileData.schoolEmail}
                              onChange={(e) => setEditProfileData({
                                ...editProfileData,
                                schoolEmail: e.target.value
                              })}
                            />
                          </div>
                          <div className="form-group">
                            <label>School ID:</label>
                            <input
                              type="text"
                              value={editProfileData.schoolId}
                              onChange={(e) => setEditProfileData({
                                ...editProfileData,
                                schoolId: e.target.value
                              })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Password:</label>
                            <input
                              type="password"
                              value={editProfileData.password}
                              onChange={(e) => setEditProfileData({
                                ...editProfileData,
                                password: e.target.value
                              })}
                            />
                          </div>
                          <div className="form-group">
                            <label>Bio:</label>
                            <textarea
                              value={editProfileData.bio}
                              onChange={(e) => setEditProfileData({
                                ...editProfileData,
                                bio: e.target.value
                              })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="button-group">
                        <button onClick={() => {
                          setIsEditProfileModal(false);
                          setIsViewProfileModal(true);
                        }} className="cancel-button">Cancel</button>
                        <button onClick={handleSaveProfile} className="save-button">Save Changes</button>
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