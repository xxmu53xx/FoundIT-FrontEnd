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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [rewardDetails, setRewardDetails] = useState(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isCongratsModalOpen, setIsCongratsModalOpen] = useState(false);



  const handleCloseModal = () => {
    setIsModalOpen(false);
    setMessage('');
    setCouponCode('');
    setRewardDetails(null);
  };

  const handleCloseRewardModal = () => {
    setIsRewardModalOpen(false);
  };

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
      const response = await axios.get('http://localhost:8083/api/rewards/getAllRewards');
      const rewards = response.data;

      const reward = rewards.find((reward) => reward.couponCode === couponCode);

      if (reward) {
        setMessage('Success! The coupon code exists.');
        setIsSuccess(true);
        setIsCouponModalOpen(false);
        setIsCongratsModalOpen(true);
      } else {
        setMessage('This coupon code does not exist.');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('An error occurred while verifying the coupon code.');
      setIsSuccess(false);
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

      {isCouponModalOpen && (
        <div className="modal-coupon">
          <div className="modal-coupon-verify">
            <div className="modal-coupon-header">
              <img src="/newadmin.png" alt="Admin Logo" className="admin-logo" />
              <h2>Redeem Coupon</h2>
              <p>redeem discounts now!</p>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                className="close-button"
                style={{
                  position: 'flex',
                  top: '37%',
                  right: '38%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#000000',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Enter coupon code"
                maxLength={5}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                style={{
                  flex: '1',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  color: '#333'
                }}
              />
              <button onClick={handleVerifyCoupon} className="confirm-button" style={{ marginLeft: '8px' }}>
                Redeem
              </button>
            </div>
            {/* No need for the "Cancel" button at the bottom */}

            {/* Success or Failure Message */}
            {message && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '4px',
                  color: isSuccess ? '#022e1f' : '#f44336',
                  backgroundColor: isSuccess ? '#ffebc2' : '#ffebc2'
                }}
              >
                <b>{message}</b>
              </div>
            )}
          </div>
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

      {isCongratsModalOpen && (
        <div className="modal-coupon2">
          <div className="modal-coupon-success">
            <img src="/newadmin.png" alt="Admin Logo" className="admin-logo" />
            <h2>Success</h2>
            <p>Your transaction was successful. Check your email for details.</p>
            <button onClick={() => setIsCongratsModalOpen(false)} className="confirm-button">
              Done
            </button>
          </div>
        </div>
      )}

      {/* Congratulations Modal */}
      {isCongratsModalOpen && (
        <div className="modal-coupon2">
          <div className="modal-coupon-success">
            <h2>Congratulations</h2>
            <p>You've just displayed this awesome Pop Up View</p>
            <button onClick={() => setIsCongratsModalOpen(false)} className="confirm-button">
              Done
            </button>
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



