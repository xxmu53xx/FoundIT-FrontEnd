import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';
import Rewards from './components/Reward';
import Points from './components/Points';
import Item from './components/ItemManagement';
import './App.css';
import axios from 'axios';
import './components/profile-modal.css'
const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [adminList, setAdminList] = useState([]);

  // Fetch admin accounts from backend
  useEffect(() => {
    axios.get('http://localhost:8083/api/users/getAllUsers')
      .then(response => setAdminList(response.data))
      .catch(error => console.error("Error fetching admin accounts:", error));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
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
        <h1 style={{ color: '#7c2d2d', fontSize: '18px', fontWeight: 'bold', marginBottom: '1.5rem' }}>Login</h1>
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
          <button 
            type="submit"
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
              marginTop: '1rem',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f5c842'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#fbbf24'}
          >
            Login
          </button>
        </form>
      </div>
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

{/*for edit profile */}
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