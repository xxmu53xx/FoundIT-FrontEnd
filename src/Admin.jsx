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
import './components/verifycoupon.css'; // Import the new CSS file

// Icons
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PersonIcon from '@mui/icons-material/Person';
import StarsIcon from '@mui/icons-material/Stars';
import PointIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import LogoutIcon from '@mui/icons-material/Logout';
import TicketIcon from '@mui/icons-material/ConfirmationNumber'; // Import ticket icon
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge } from '@mui/material';

const AdminDashboard = ({ user, onLogout, onUserUpdate }) => {
  //ticket/coupon modal design is in sidebar.css
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [rewardDetails, setRewardDetails] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isCongratsModalOpen, setIsCongratsModalOpen] = useState(false);
  const [isUnclaimedModalOpen, setUnclaimedModalOpen] = useState(false);
  const navigate = useNavigate();

  const [zoomedImage, setZoomedImage] = useState(null); // State for the zoomed image
  const [username, setUsername] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isViewProfileModal, setIsViewProfileModal] = useState(false);
  const [unverifiedItems, setUnverifiedItems] = useState([]);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
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
      isAdmin: true
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
      alert('Profile updated successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Error updating profile');
      alert('Failed to update profile. Please try again.');
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
        alert('Account deactivated successfully.');
        navigate('/login');
      } catch (error) {
        setError(error.response?.data?.message || 'Error deactivating account');
        alert('Failed to deactivate account. Please try again.');
      }
    } else {
      alert('Incorrect password. Please try again.');
    }
  };


  const handleVerifyCoupon = async () => {
    try {
        const [rewardsResponse, usersResponse] = await Promise.all([
            axios.get('http://localhost:8083/api/rewards/getAllRewards'),
            axios.get('http://localhost:8083/api/users/getAllUsers'),
        ]);

        const rewardsData = rewardsResponse.data;
        const usersData = usersResponse.data;

        const enhancedRewards = rewardsData.map((reward) => {
            const associatedUser   = usersData.find((user) =>
                user.rewards.some((userReward) => userReward.rewardId === reward.rewardId)
            );

            return {
                ...reward,
                userEmail: associatedUser   ? associatedUser .schoolEmail : 'Unassigned',
                userId: associatedUser   ? associatedUser .userID : null,
            };
        });

        const reward = enhancedRewards.find((reward) => reward.couponCode === couponCode);

        if (!reward) {
            setMessage('This coupon code does not exist.');
            setIsSuccess(false);
            return;
        }

        // Check if the reward is unclaimed
        if (!reward.isClaimed) {
            setMessage('This reward has not been claimed and cannot be redeemed.');
            setIsSuccess(false);
            return;
        }

        // Check if the reward is already claimed
        if (reward.isUsed) {
            setMessage('This reward has already been claimed and cannot be reused.');
            setIsSuccess(false);
            return;
        }

        // If the reward is claimed, proceed with the rest of the logic
        setMessage('Success! The coupon code exists.');
        setIsSuccess(true);
        setIsCouponModalOpen(false);
        setRewardDetails(reward);
        setIsCongratsModalOpen(true);

        // Update the reward to set isUsed to true
        await axios.put(`http://localhost:8083/api/rewards/putReward/${reward.rewardId}`, {
            ...reward, // Spread the existing reward properties
            isUsed: true, // Set isUsed to true
            user: {
                userID: reward.userId // Include the user ID
            }
        });

        // Update the state to reflect the change
        setRewardDetails((prev) => ({
            ...prev,
            isUsed: true,
        }));

    } catch (error) {
        setMessage('An error occurred while verifying the coupon code.');
        setIsSuccess(false);
        console.error('Error verifying coupon:', error);
    }
};
  const toggleNotificationModal = () => {
    setIsNotificationModalOpen(!isNotificationModalOpen);
  };

  const handleAcceptItem = async (itemID) => {
    try {
      // Fetch the current item details to keep other properties intact
      const response = await axios.get(`http://localhost:8083/api/items/getItemDetails/${itemID}`);
      const itemDetails = response.data;

      // Update the isVerified property while keeping other properties
      const updatedItem = {
        ...itemDetails,
        isVerified: true,
      };

      // Send the updated item back to the server
      await axios.put(`http://localhost:8083/api/items/putItemDetails/${itemID}`, updatedItem);

      // Update local state
      setUnverifiedItems(prevItems => prevItems.filter(item => item.itemID !== itemID));
      alert('Item accepted successfully!');
    } catch (error) {
      console.error('Error accepting item:', error);
      alert('Error accepting item. Please try again.');
    }
  };

  const handleRejectItem = async (itemID) => {
    // Logic to delete the item
    try {
      await axios.delete(`http://localhost:8083/api/items/deleteItemDetails/${itemID}`);

      // Update local state
      setUnverifiedItems(prevItems => prevItems.filter(item => item.itemID !== itemID));
      alert('Item rejected and deleted successfully!');
    } catch (error) {
      alert('Error rejecting item. Please try again.');
    }
  };

  useEffect(() => {
    // Filter items to get only those with isVerified as false
    if (user && user.items) {
      const unverified = user.items.filter(item => !item.isVerified);
      setUnverifiedItems(unverified);
    }
  }, [user]);


  const fetchUnverifiedItems = async () => {
    try {
      const [itemsResponse, usersResponse] = await Promise.all([
        axios.get('http://localhost:8083/api/items/getAllItems'),
        axios.get('http://localhost:8083/api/users/getAllUsers')
      ]);

      const itemsData = itemsResponse.data;
      const usersData = usersResponse.data;

      // Filter items where isVerified is false
      const filteredItems = itemsData.filter(item => !item.isVerified);

      // Map user items to their corresponding user emails
      const enhancedUnverifiedItems = filteredItems.map(item => {
        const associatedUser = usersData.find(user =>
          user.items.some(userItem => userItem.itemID === item.itemID)
        );

        return {
          ...item,
          userEmail: associatedUser ? associatedUser.schoolEmail : 'Unassigned', // Use schoolEmail for userEmail
          userId: associatedUser ? associatedUser.userID : null // Ensure userId is set
        };
      });

      // Update state with the enhanced unverified items
      setUnverifiedItems(enhancedUnverifiedItems);
      setNotificationCount(enhancedUnverifiedItems.length); // Update the notification count
      setError(null);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Error fetching items');
    }
  };
  useEffect(() => {
    fetchUnverifiedItems();
  }, []);


  //setImage zoom and unzoom
  const handleImageClick = (image) => {
    setZoomedImage(image);
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };
  return (
    <div className="dashboard">
      <header className="header">
        <NavLink to="" end className="nav-item">
          <img src="/citlogo.png" alt="University Logo" className="university-logo" />
        </NavLink>

        <div className="notification-icon" onClick={toggleNotificationModal}>
          <Badge badgeContent={notificationCount} color="secondary">
            <NotificationsIcon />
          </Badge>
        </div>

        <div className="user-profile" onClick={handleProfileViewClick}>
          <div className="user-info">
            <span className="user-name">{user?.schoolEmail.split('@')[0] || 'Guest'}</span>
            <span className="user-id">{user?.schoolId || '00-0000-000'}</span>
            <span className="curPoints">ADMIN</span>
          </div>
          <img src="/dilao.png" alt="User  Profile" className="profile-picture" />
        </div>

      </header>

      {/* Floating Ticket Button */}
      <button className="ticket-button" onClick={() => setIsCouponModalOpen(true)}>
        <TicketIcon />
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

      {isUnclaimedModalOpen && (
  <div className="modal-overlay2">
    <div className="modal-container2">
      <h2>This Coupon is Not Yet Claimed</h2>
      <p>Please note that this coupon has not been claimed yet.</p>
      <div className="button-group">
        <button
          type="button"
          className="confirm-button"
          onClick={() => setUnclaimedModalOpen(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      {isCouponModalOpen && (
  <div className="modal-coupon">
    <div className="modal-coupon-verify">
      <div className="modal-coupon-header">
        <img
          src="/removebg.png"
          alt="Admin Logo"
          className="admin-logo"
        />
        <h2 className="modal-title">Redeem Code</h2>
        <p className="modal-subtitle">We need more info to redeem your coupon.</p>
      </div>
      <div className="modal-body">
        <input
          type="text"
          placeholder="Enter your coupon code"
          maxLength={5}
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="input-field"
        />
        <p className="modal-info">Send us details to proceed with verification.</p>
      </div>
      <div className="modal-footer">
        <button
          onClick={() => setIsCouponModalOpen(false)}
          className="cancel-button"
        >
          Cancel
        </button>
        <button onClick={handleVerifyCoupon} className="redeem-button">
          Redeem
        </button>
      </div>
      {message && (
        <div
          className={`message-box ${isSuccess ? "success" : "failure"}`}
        >
          <b>{message}</b>
        </div>
      )}
    </div>
  </div>
)}
 {zoomedImage && (
        <div
          className="zoom-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closeZoom}
        >
          <img
            src={zoomedImage}
            alt="Zoomed Item"
            style={{
              maxWidth: '80%',
              maxHeight: '80%',
              borderRadius: '8px',
            }}
          />
        </div>
      )}

      {/* Notification Modal */}
      {isNotificationModalOpen && (
        <div className="modal-notif">
          <div className="modal-container-notif">
            <h2>Unverified Items</h2>
            {unverifiedItems.length === 0 ? (
              <p>No unverified items to display.</p>
            ) : (
              <table className="item-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Date Lost/Found</th>
                    <th>Registered By</th>
                    <th>Status</th>
                    <th>Location</th>
                    <th>Image</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {unverifiedItems.map(item => (
                    <tr key={item.itemID}>
                      <td>{item.description}</td>
                      <td>{new Date(item.dateLostOrFound).toLocaleDateString()}</td>
                      <td>{item.userEmail || 'Unassigned'}</td>
                      <td>{item.status}</td>
                      <td>{item.location}</td>
                      <td>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.description}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', cursor: 'pointer' }} // Added cursor pointer
                            onClick={() => handleImageClick(item.image)} // Added click handler
                            onError={(e) => {
                              console.error(`Image load error for item ${item.itemID}`);
                              e.target.style.display = 'none'; // Hide broken image
                            }}
                          />
                        ) : (
                          'No image'
                        )}
                      </td>
                      <td>
                        <button onClick={() => handleAcceptItem(item.itemID)} className="edit-btn">Accept</button>
                        <button onClick={() => handleRejectItem(item.itemID)} className="delete-btn">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <button onClick={toggleNotificationModal} className="close-button">Close</button>
          </div>
        </div>
      )}

      

      {/* Congratulations Modal */}
      {isCongratsModalOpen && (
  <div className="modal-coupon2">
    <div className="modal-coupon-success">
      <div className="congrats-header">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          className="congrats-icon"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h2>Congratulations!</h2>
      </div>
      {rewardDetails && (
        <div className="congrats-content">
          <div className="reward-image">
            {rewardDetails.image ? (
              <img 
                src={rewardDetails.image} 
                alt={rewardDetails.rewardName}
                className="reward-image-preview"
              />
            ) : (
              <div className="no-image-placeholder">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  className="placeholder-icon"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>No Image Available</span>
              </div>
            )}
          </div>

          <div className="reward-details">
            <h3>{rewardDetails.rewardName}</h3>
            <div className="reward-info">
              <div className="info-item">
                <span className="info-label">Reward Type:</span>
                <span className="info-value">{rewardDetails.rewardType}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Points Required:</span>
                <span className="info-value">{rewardDetails.pointsRequired}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Purchased By:</span>
                <span className="info-value">{rewardDetails.userEmail}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Coupon Code:</span>
                <span className="info-value coupon-code">
                  {rewardDetails.couponCode}
                  <button 
                    onClick={() => navigator.clipboard.writeText(rewardDetails.couponCode)}
                    className="copy-button"
                    title="Copy Coupon Code"
                  >
                    📋
                  </button>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="congrats-actions">
        <button 
          onClick={() => {
            setIsCongratsModalOpen(false);
            setRewardDetails(null);
          }} 
          className="confirm-button"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
      {/* View Profile Modal */}
      {isViewProfileModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="content1-header">
            </div>

            <div className="profile-body">
              <div className="profile-left">
                <img src="/dilao.png" alt="User Profile" className="profile-picture1" />
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



