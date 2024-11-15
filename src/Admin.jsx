import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';
import Rewards from './components/Reward';
import Points from './components/Points';
import Item from './components/ItemManagement';
import axios from 'axios';
import './components/profile-modal.css'
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import './App.css';
const AdminDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isViewProfileModal, setIsViewProfileModal] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [profileData, setProfileData] = useState({
    schoolEmail: '',
    schoolId: '',
    password: '',
    bio: '',
  });

  useEffect(() => {
  
    if (!user || user.accountType !== 'admin') {
      navigate('/login');
      return;
    }

    const displayName = user.schoolEmail.split('@')[0];
    setUsername(displayName);
    setProfileData({
      userID: user.userID,
      schoolId: user.schoolId,
      password: user.password,
      bio: user.bio,
      schoolEmail: user.schoolEmail,
      currentPoints: user.currentPoints
    });
  }, [user, navigate]);

  const handleProfileViewClick = () => {
    setIsViewProfileModal(true);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:8083/api/users/putUserDetails/${user.userID}`, profileData)
      .then((response) => {
        setProfileData(response.data);
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
          onLogout();
          alert("Account deactivated successfully.");
          navigate('/login');
        })
        .catch((error) => console.error("Error deactivating account:", error));
    } else {
      alert("Incorrect password. Please try again.");
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <img src="/citlogo.png" alt="University Logo" className="university-logo" />
        <input type="text" className="search-bar" placeholder="Search..." />
        <div className="user-profile" onClick={handleProfileViewClick}>
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
            <NavLink to="" end className="nav-link">📋 Reports</NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="user-management" className="nav-link">👥 Manage User</NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="rewards" className="nav-link">🎁 Manage Rewards</NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="points" className="nav-link">🍃 Manage Points</NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to="item" className="nav-link">📦 Manage Items</NavLink>
          </li>
          <li className="sidebar-item">
            <button onClick={onLogout} className="logout-button">🔓 Logout</button>
          </li>
        </ul>
      </div>

{/*Ari butang mga jsxs*/}
      <div className="main-content">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="points" element={<Points />} />
          <Route path="item" element={<Item />} />
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
              <button onClick={() => setIsProfileModalOpen(true)} className="edit-button">Edit Profile</button>
              <button type="button" className="confirm-button" onClick={handleDeactivateAccount}>Deactivate Account</button>
            </div>
          </div>
        </div>
      )}

      {isProfileModalOpen && (
        <div className="modal-overlay2">
          <div className="modal-container2">
            <h2>Edit Profile</h2>
            <h4>What would you like to change, {username}?</h4>
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label>Email:</label>
                <input type="text" name="email" value={profileData.schoolEmail} onChange={handleProfileChange} disabled />
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
                <button type="button" className="cancel-button" onClick={() => setIsProfileModalOpen(false)}>Cancel</button>
                <button type="button" className="confirm-button" onClick={handleDeactivateAccount}>Deactivate Account</button>
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
  );
};

export default AdminDashboard;