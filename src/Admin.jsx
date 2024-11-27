import { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import UserManagement from './components/UserManagement';
import Dashboard from './components/Dashboard';
import Rewards from './components/Reward';
import Points from './components/Points';
import Item from './components/ItemManagement';
import axios from 'axios';
import './components/profile-modal.css';
import './components/sidebar.css';

import './components/Design.css'

// Icons
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PersonIcon from '@mui/icons-material/Person';
import StarsIcon from '@mui/icons-material/Stars';
import PointIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import TicketIcon from '@mui/icons-material/ConfirmationNumber'; // Import ticket icon

const AdminDashboard = ({ user, onLogout, onUserUpdate }) => {

  //ticket/coupon modal design is in sidebar.css
//ticket modal
const [isModalOpen, setIsModalOpen] = useState(false);
const [couponCode, setCouponCode] = useState("");
const [message, setMessage] = useState("");
const [isSuccess, setIsSuccess] = useState(false);
const [rewardDetails, setRewardDetails] = useState(null);
const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);


const handleCloseModal = () => {
  setIsModalOpen(false);
  setMessage("");
  setCouponCode("");
  setRewardDetails(null);
};

const handleCloseRewardModal = () => {
  setIsRewardModalOpen(false);
};
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isViewProfileModal, setIsViewProfileModal] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    userID: '',
    schoolEmail: '',
    schoolId: '',
    password: '',
    bio: '',
    currentPoints: 0,
    accountType: '',
    isAdmin: true // Add isAdmin field
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
      bio: user.bio || '',
      schoolEmail: user.schoolEmail,
      currentPoints: user.currentPoints,
      accountType: user.accountType,
      isAdmin: true // Ensure isAdmin is set to true for admin users
    });
  }, [user, navigate]);

  const handleProfileViewClick = () => {
    setIsViewProfileModal(true);
    setIsEditing(false);
  };

  const handleEditProfileClick = () => {
    setIsViewProfileModal(false);
    setIsProfileModalOpen(true);
    setIsEditing(true);
    setProfileData(prevData => ({
      ...prevData
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const toggleProfileModal = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
    if (!isProfileModalOpen) {
      setIsEditing(false);
      setProfileData({
        userID: user.userID,
        schoolId: user.schoolId,
        password: user.password,
        bio: user.bio || '',
        schoolEmail: user.schoolEmail,
        currentPoints: user.currentPoints,
        accountType: user.accountType
      });
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const updatePayload = {
        ...profileData,
        accountType: 'admin',
        isAdmin: true // Explicitly set isAdmin to true in the update payload
      };

      const response = await axios.put(
        `http://localhost:8083/api/users/putUserDetails/${profileData.userID}`, 
        updatePayload
      );
      
      setProfileData({
        ...response.data,
        isAdmin: true // Ensure isAdmin remains true after update
      });
      setIsProfileModalOpen(false);
      setIsEditing(false);
      setError(null);
      
      if (response.data && onUserUpdate) {
        onUserUpdate({
          ...response.data,
          isAdmin: true // Ensure isAdmin remains true in the parent component
        });
      }
      alert("Profile updated successfully!");
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating profile');
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleDeactivateAccount = () => {
    setIsProfileModalOpen(false);
    setIsViewProfileModal(false);
    setIsDeactivateModalOpen(true);
  };

  const confirmDeactivation = async () => {
    if (passwordInput === user.password) {
      try {
        await axios.delete(`http://localhost:8083/api/users/deleteUserDetails/${user.userID}`);
        onLogout();
        alert("Account deactivated successfully.");
        navigate('/login');
      } catch (error) {
        setError(error.response?.data?.message || 'Error deactivating account');
        alert("Failed to deactivate account. Please try again.");
      }
    } else {
      alert("Incorrect password. Please try again.");
    }
  }; const handleVerifyCode = async () => {
    try {
      const response = await axios.get("http://localhost:8083/api/rewards/getAllRewards");
      const rewards = response.data;

      const reward = rewards.find((reward) => reward.couponCode === couponCode);

      if (reward) {
        setMessage("Success! The coupon code exists.");
        setIsSuccess(true);
        setRewardDetails(reward); // Store reward details
        setIsRewardModalOpen(true); // Open reward details modal
      } else {
        setMessage("This coupon code does not exist.");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("An error occurred while verifying the coupon code.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
      <NavLink to="" end className="nav-item">
        <img src="/citlogo.png" alt="University Logo" className="university-logo" /></NavLink>
        
        <div className="user-profile" onClick={handleProfileViewClick}>
          <div className="user-info">
            <span className="user-name">{user?.schoolEmail.split('@')[0] || 'Guest'}</span>
            <span className="user-id">{user?.schoolId|| '00-0000-000'}</span>
            <span className="curPoints">ADMIN</span>
          </div>
          <img src="/dilao.png" alt="User Profile" className="profile-picture" />
        </div>
      </header>

       {/* Floating Ticket Button */}
       <button className="ticket-button" onClick={() => setIsModalOpen(true)}>
        <TicketIcon/>
      </button>

      <div className="modern-sidebar">
        <div className="sidebar-brand">
          <span className="found">Found</span>
          <span className="it">IT</span>
          <span className="admin">Admin</span>
        </div>
        
        <div className="nav-links">
          <NavLink to="" end className="nav-item">
            <ContentPasteIcon sx={{ fontSize: 24 }} />
            <span className="nav-label">Reports</span>
          </NavLink>

          <NavLink to="user-management" className="nav-item">
            <PersonIcon sx={{ fontSize: 24 }} />
            <span className="nav-label">Manage Users</span>
          </NavLink>

          <NavLink to="rewards" className="nav-item">
            <StarsIcon sx={{ fontSize: 24 }} />
            <span className="nav-label">Manage Rewards</span>
          </NavLink>

          <NavLink to="points" className="nav-item">
            <PointIcon sx={{ fontSize: 24 }} />
            <span className="nav-label">Manage Points</span>
          </NavLink>

          <NavLink to="item" className="nav-item">
            <InventoryIcon sx={{ fontSize: 24 }} />
            <span className="nav-label">Manage Items</span>
          </NavLink>
        </div>

        <button onClick={onLogout} className="logout-item">
          <LogoutIcon sx={{ fontSize: 24 }} />
          <span className="nav-label">Logout</span>
        </button>
      </div>

      <div className="main-content">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="user-management" element={<UserManagement />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="points" element={<Points />} />
          <Route path="item" element={<Item />} />
        </Routes>
      </div>

      {isModalOpen && (
        <div className="modal-overlay1">
          <div className="modal-container2">
            <h2>Verify Coupon Code</h2>
            <p>Enter the 5-digit coupon code below:</p>
            
            <input
              type="text"
              placeholder="Enter coupon code"
              maxLength={5}
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{ marginBottom: "16px", padding: "8px", width: "100%" }}
            />
            <div className="button-group">
              <button
                onClick={handleVerifyCode}
                className="confirm-button"
                style={{ marginRight: "8px" }}
              >
                Verify
              </button>
              <button onClick={handleCloseModal} className="cancel-button">
                Cancel
              </button>
            </div>

            {/* Success or Failure Message */}
            {message && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  borderRadius: "4px",
                  color: isSuccess ? "#022e1f" : "#f44336",
                  backgroundColor: isSuccess ? "#ffebc2" : "#ffebc2",
                }}
              >
                <b>{message}</b>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Reward Details Modal */}
      {isRewardModalOpen && rewardDetails && (
        <div className="modal-overlay1">
          <div className="modal-container2">
            <h2>Reward Details</h2>
            <p><strong>Reward Name:</strong> {rewardDetails.rewardName}</p>
            <p><strong>Reward Type:</strong> {rewardDetails.rewardType}</p>
            <p><strong>Points Required:</strong> {rewardDetails.pointsRequired}</p> 
            <br></br>
              <button onClick={handleCloseRewardModal} className="confirm-button">
                Close
              </button>
            
          </div>
        </div>
      )}


      {/* View Profile Modal */}
      {isViewProfileModal && (
        <div className="modal-overlay">
          <div className="modal-container">
          <div className="content1-header">
              {error && <p className="error">{error}</p>}
            </div>

            <div className="profile-body">
              <div className="profile-left">
                <img src="/dilao.png" alt="User Profile" className="profile-picture1" />
                <div className="about-me">
                  <h3>Bio</h3>
                  <p>{profileData.bio || 'No bio available'}</p>
                </div>
              </div>

              <div className="profile-right">
                <p><strong>Email:</strong> {profileData.schoolEmail}</p>
                <p><strong>School ID:</strong> {profileData.schoolId}</p>
                <p><strong>Password:</strong> {profileData.password}</p>
                <p><strong>Current Points:</strong> {profileData.currentPoints}</p>
                <p><strong>Account Type:</strong> {profileData.accountType}</p>
              </div>
            </div>

            <div className="button-group">
              <button onClick={() => setIsViewProfileModal(false)} className="delete-btn">
                Cancel
              </button>
              <button onClick={handleEditProfileClick} className="edit-button">
                Edit Profile
              </button>
              <button onClick={handleDeactivateAccount} className="confirm-button">
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div className="modal-overlay2">
          <div className="modal-container2">
            <h2>{isEditing ? 'Edit Profile' : 'View Profile'}</h2>
            <h4>What would you like to change, {username}?</h4>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleProfileSave}>
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="text" 
                  name="schoolEmail" 
                  value={profileData.schoolEmail} 
                  onChange={handleProfileChange} 
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>School ID:</label>
                <input 
                  type="text" 
                  name="schoolId" 
                  value={profileData.schoolId} 
                  onChange={handleProfileChange} 
                  disabled 
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input 
                  type="text" 
                  name="password" 
                  value={profileData.password} 
                  onChange={handleProfileChange} 
                />
              </div>
              <div className="form-group">
                <label>Bio:</label>
                <textarea 
                  name="bio" 
                  value={profileData.bio} 
                  onChange={handleProfileChange} 
                />
              </div>
              <div className="form-group">
                <label>Account Type:</label>
                <input 
                  type="text" 
                  name="accountType" 
                  value={profileData.accountType} 
                  disabled 
                />
              </div>
              <div className="button-group">
                <button type="submit" className="save-button">
                  {isEditing ? 'Update Profile' : 'Save Changes'}
                </button>
                <button 
                  type="button" 
                  className="delete-btn" 
                  onClick={toggleProfileModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Account Modal remains the same */}
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
              <button onClick={confirmDeactivation} className="confirm-button">
                Confirm
              </button>
              <button 
                onClick={() => setIsDeactivateModalOpen(false)} 
                className="delete-btn" 
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
}

export default AdminDashboard;



