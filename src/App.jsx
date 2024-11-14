import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';
import Rewards from './components/Reward';
import Points from './components/Points';
import Item from './components/ItemManagement';
import axios from 'axios';
import './components/profile-modal.css'
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
import Signup from './components/Signup';
import './App.css';

const Login = ({ onLogin }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [adminList, setAdminList] = useState([]);

  // Fetch admin accounts from backend
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
    
    // Find user from admin list based on the selected email
    const user = adminList.find(user => user.schoolEmail === credentials.email);
    if (!user) {
      setError('Email not found');
      return;
    }
    if (user.password !== credentials.password) {
      setError('Invalid password');
      return;
    }

    // Pass user to the parent component
    onLogin(user);
    
    // Handle different login redirects based on user type
    if (selectedType === 'admin') {
      console.log("Navigate to admin dashboard");
      // window.location.href = '/admin/dashboard';
    } else {
      console.log("Navigate to student dashboard");
      // window.location.href = '/student/dashboard';
    }
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

const ProtectedRoute = ({ children, isAuthenticated }) => {
  return isAuthenticated ? children : <Navigate to="/login" />;
};
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isviewProfileModal,setIsviewProfileModal] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [profileData, setProfileData] = useState({
    schoolEmail:'',
    schoolId: '',
    password: '',
    bio: '',
  });

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    const displayName = userData.schoolEmail.split('@')[0];
    setUsername(displayName);
    setProfileData({
      userID:userData.userID,
      schoolId: userData.schoolId,
      password: userData.password,
      bio: userData.bio,
      schoolEmail:userData.schoolEmail,
      currentPoints:userData.currentPoints
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleProfileClick = () => {
    //this one is for edit
    //if set true edit profile will popup
    setIsProfileModalOpen(true);
  };
  const handProfileViewClick=()=>{
    //this one if for view profile
    //if set true view profile will popup, this should appeaer first before editing
    setIsviewProfileModal(true);

  }
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:8083/api/users/putUserDetails/${user.userID}`, profileData)
      .then((response) => {
        setUser(response.data);
        setIsProfileModalOpen(false);
        alert("Profile updated successfully!");
      })
      .catch((error) => console.error("Error updating profile:", error));
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
          window.location.href = '/login';
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
            !isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />
          }
        />

        <Route
          path="/*"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <div className="dashboard">
                <header className="header">
                  <img src="/citlogo.png" alt="University Logo" className="university-logo" />
                  <input type="text" className="search-bar" placeholder="Search..." />



                  <div className="user-profile" onClick={handProfileViewClick}>
                    <span className="user-name">{username || 'Guest'}</span>
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
                      <NavLink to="/" className="nav-link">📋 Reports</NavLink>
                    </li>
                    <li className="sidebar-item">
                      <NavLink to="/user-management" className="nav-link">👥Manage User</NavLink>
                    </li>
                    <li className="sidebar-item">
                      <NavLink to="/rewards" className="nav-link">🎁 Manage Rewards</NavLink>
                    </li>
                    <li className="sidebar-item">
                      <NavLink to="/points" className="nav-link">🍃 Manage Points</NavLink>
                    </li>
                    <li className="sidebar-item">
                      <NavLink to="/item" className="nav-link">📦 Manage Items</NavLink>
                    </li>
                    <li className="sidebar-item">
                      <button onClick={handleLogout} className="logout-button">🔓 Logout</button>
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
          }
        />
      </Routes>
{/*for viewing */}
      {isviewProfileModal &&(
 <div className="modal-overlay2">
 <div className="modal-container2"><div className="content-header"> 
 <img src="/dilao.png" alt="User Profile" className="profile-picture" /><h2>Profile Information</h2></div>
   <div className="profile-info">
     <p><strong>Email:</strong> {user.schoolEmail}</p>
     <p><strong>School ID:</strong> {user.schoolId}</p>
     <p><strong>Password:</strong> {user.password}</p>
     <p><strong>Bio:</strong> {user.bio}</p>
     <p><strong>Current Points:</strong> {user.currentPoints}</p>
   </div>
   <div className="button-group">
     <button onClick={()=>setIsviewProfileModal(false)} className="cancel-button">Cancel</button>
     <button onClick={()=>setIsProfileModalOpen(true)} className="edit-button">Edit Profile</button>
     <button type="button" className="confirm-button" onClick={handleDeactivateAccount}>Deactivate Account</button>
   </div>
 </div>
</div>
      )}

      {isProfileModalOpen && (
        <div className="modal-overlay2">
          <div className="modal-container2">
            <h2>Edit Profile</h2>
            <h4>What would like to change? {username}</h4>
            <form onSubmit={handleProfileSave}>
            <div className="form-group">
                <label>Email:</label>
                <input type="text" name="email" value={profileData.schoolEmail} onChange={handleProfileChange} disabled/>
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input type="text" name="password" value={profileData.password} onChange={handleProfileChange} />
              </div>
              <div className="form-group">
                <label>Bio:</label>
                <textarea name="bio" value={profileData.bio} onChange={handleProfileChange} />
              </div>
              <div className="button-group">
                <button type="submit" className="save-button">Save Changes</button>
                <button type="button" className="cancel-button" onClick={()=>setIsProfileModalOpen(false)}>Cancel</button>
              
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeactivateModalOpen && (
        <div className="modal-overlay2">
          <div className="modal-container2">
            <h2>Confirm Deactivation</h2>
            <p>Enter your password to confirm account deactivation.</p>
            <input
              type="text"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            <div className="button-group">
              <button onClick={confirmDeactivation} className="confirm-button">Confirm</button>
              <button onClick={() => setIsDeactivateModalOpen(false)} className="cancel-button" style={{ backgroundColor: '#f44336', color: '#fff' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;