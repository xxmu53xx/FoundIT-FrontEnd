import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Design.css';
import './Item.css';

function ItemManagement({ user }) {

  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showUserDetailsPopup, setShowUserDetailsPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [zoomedImage, setZoomedImage] = useState(null);
  const [item, setItem] = useState({
    description: '',
    dateLostOrFound: '',
    userId: '',
    location: '',
    status: 'Found',
    image: ''
  });

  const fetchItems = async () => {
    try {
      const [itemsResponse, usersResponse] = await Promise.all([
        axios.get('http://localhost:8083/api/items/getAllItems'),
        axios.get('http://localhost:8083/api/users/getAllUsers')
      ]);

      const itemsData = itemsResponse.data;
      const usersData = usersResponse.data;

      const enhancedItems = itemsData.map(item => {
        const associatedUser = usersData.find(user =>
          user.items.some(userItem => userItem.itemID === item.itemID)
        );

        return {
          ...item,
          userEmail: associatedUser ? associatedUser.schoolEmail : 'Unassigned'
        };
      });

      const sortedItems = enhancedItems.sort((a, b) =>
        new Date(b.dateLostOrFound) - new Date(a.dateLostOrFound)
      );

      setItems(sortedItems);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching items and users');
    }
  };
  useEffect(() => {
    fetchItems();
  }, [user]);

  const togglePopup = () => {
    setShowPopup(!showPopup);
    if (!showPopup) {
      setItem({
        description: '',
        dateLostOrFound: '',
        location: '',
        status: 'Found',
        image: ''
      });
    }
  };

  const handleOpenClaimPopup = (item) => {
    setSelectedItem(item);
    setShowClaimPopup(true);
  };

  const handleCloseClaimPopup = () => {
    setShowClaimPopup(false);
    setSelectedItem(null);
  };

  const handleClaimItem = async () => {
    if (!selectedItem) return;

    try {
      const response = await axios.put(`http://localhost:8083/api/items/updateItem/${selectedItem.itemID}`, {
        ...selectedItem,
        status: 'Claimed',
        claimedByUser: {
          userID: user.userID
        }
      });

      if (response.status === 200) {
        await fetchItems();
        handleCloseClaimPopup();
        setError(null);
      }
    } catch (error) {
      console.error('Claim error:', error);
      setError(`Error claiming item: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
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
        setItem(prev => ({
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

  const handleZoomImage = (imageSrc) => {
    setZoomedImage(imageSrc);
  };

  const handleCloseZoom = () => {
    setZoomedImage(null);
  };
  const closeZoom = () => {
    setZoomedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const itemData = {
        ...item,
        dateLostOrFound: new Date(item.dateLostOrFound).toISOString(),
        user: {
          userID: user.userID
        }
      };

      const response = await axios({
        method: 'post',
        url: 'http://localhost:8083/api/items/postItem',
        data: itemData,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200 || response.status === 201) {
        await fetchItems();
        togglePopup();
        setError(null);
      }
    } catch (error) {
      console.error('Submission error:', error);
    }
  };
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
  };

  /*user popup from display items */
  const fetchUserDetails = async (email) => {
    try {
      const response = await axios.get(`http://localhost:8083/api/users/getUserByEmail/${email}`);
      setUserDetails(response.data);
      setShowUserDetailsPopup(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      setError('Error fetching user details');
    }
  };

  const handleCloseUserDetailsPopup = () => {
    setShowUserDetailsPopup(false);
    setUserDetails(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredItems = items.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm =
      (item.dateLostOrFound && item.dateLostOrFound.toString().includes(searchTermLower)) ||
      (item.description && item.description.toLowerCase().includes(searchTermLower)) ||
      (item.userEmail && item.userEmail.toLowerCase().includes(searchTermLower)) ||
      (item.location && item.location.toLowerCase().includes(searchTermLower));

    const matchesStatus =
      (!statusFilter || item.status.toLowerCase() === statusFilter.toLowerCase()) &&
      !item.isClaimed &&  // Only show unclaimed items
      item.isVerified;     // Only show items that are verified

    return matchesSearchTerm && matchesStatus;
  });
  const renderItemStatus = (item) => {
    // Check if the current user is the one who registered the item
    const isUserItem = item.userEmail === user.schoolEmail;

    if (isUserItem) {
      if (item.status === 'Found') {
        return (
          <div
            style={{
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'center'
            }}
          >
            Your Post
          </div>
        );
      } else if (item.status === 'Lost') {
        return (
          <div
            style={{
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              fontSize: '14px',
              marginTop: '10px',
              textAlign: 'center'
            }}
          >
            Your Lost Item
          </div>
        );
      }
    }

    // If not the user's item and status is Found, show Claim button
    if (item.status === 'Found') {
      return (
        <button
          onClick={() => handleOpenClaimPopup(item)}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '10px'
          }}
        >
          Claim Item
        </button>
      );
    }

    // For Lost items that are not the user's, return null
    return null;
  };
  return (
    <div className="content">
      <br></br>
      <div className="content-header">
        <h1>General LOST and FOUND</h1>
        <div className="coheader">
          <select
            className="status-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Found">Found</option>
            <option value="Lost">Lost</option>
          </select>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <input
            type="text"
            className="search-bar"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={togglePopup} className="add-button1" title="Add Item">
            <h6>+ Add Item</h6>
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {filteredItems.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            color: '#666',
            padding: '20px',
          }}
        >
          Nothing to see here
        </div>
      ) :(
      <div className="horizontal-scroll-container">
        {filteredItems.map((item) => (
          <div className="item-card" key={item.itemID}>
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Date:</strong> {new Date(item.dateLostOrFound).toLocaleDateString()}</p>
            <p>
              <strong>Registered By:</strong>
              <span
                style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => fetchUserDetails(item.userEmail)}
              >
                {item.userEmail}
              </span>
            </p>
            <p><strong>Location:</strong> {item.location}</p>
            {renderItemImage(item)}
            <p><strong>Status:</strong> {item.status}</p>
            {renderItemStatus(item)}
          </div>
        ))}
      </div>)}


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

      {showPopup && (
        <div className="modal-overlay" onClick={togglePopup}>
          <div
            className="popup1"
            onClick={(e) => e.stopPropagation()}
            style={{ height: 'auto', width: '500px' }}
          >
            <h2>Create New Item</h2>
            <form onSubmit={handleSubmit} className="item-form">
              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  name="description"
                  value={item.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date Lost/Found:</label>
                <input
                  type="date"
                  name="dateLostOrFound"
                  value={item.dateLostOrFound}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Registered By:</label>
                <input
                  type="text"
                  value={user.schoolEmail}
                  disabled
                />
              </div>

              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={item.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status:</label>
                <select
                  className="dropdown"
                  name="status"
                  value={item.status}
                  onChange={handleChange}
                >
                  <option value="Found">Found</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="form-group">
                <label>Image (5MB MAX) (Optional):</label>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                {/*  {item.image && <img src={item.image} alt="Preview" className="image-preview" />}*/
                /*Purposely hidden to prevent overlapping */}
              </div>

              {error && <div className="error">{error}</div>}

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button type="submit" className="edit-btn">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUserDetailsPopup && userDetails && (
        <div className="modal-overlay" onClick={handleCloseUserDetailsPopup}>
          <div
            className="modal-container" // Changed class name for consistency
            onClick={(e) => e.stopPropagation()}
            style={{
              height: 'auto',
              width: '500px', // Adjusted width for better layout
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
          >
            <div className="content1-header">

            </div>

            <div className="profile-body" style={{ display: 'flex' }}>
              <div className="profile-left1" style={{ flex: 1, paddingRight: '20px' }}>
                <img src={userDetails.image || "/NullPFP.png"} alt="User  Profile" className="profile-picture1" style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
                <div className="about-me1">
                  <br></br>
                  <h3>Bio</h3>
                  <p>{userDetails.bio || 'No bio available'}</p>
                </div>
              </div>

              <div className="profile-right" style={{ flex: 1 }}>
                <div>
                  <strong>Email:</strong> {userDetails.schoolEmail}
                </div>
                <br></br>
                <div>
                  <strong>School ID:</strong> {userDetails.schoolId}
                </div>
                <br></br>
                <div>
                  <strong>Current Points:</strong> {userDetails.currentPoints}
                </div>

              </div>
            </div>


          </div>
        </div>
      )}
      {showClaimPopup && selectedItem && (
        <div className="modal-overlay" onClick={handleCloseClaimPopup}>
          <div
            className="popup1"
            onClick={(e) => e.stopPropagation()}
            style={{
              height: 'auto',
              width: '400px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Claim Item</h2>

            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Description:</strong>
                <div>{selectedItem.description}</div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Date Found:</strong>
                <div>
                  {selectedItem.dateLostOrFound
                    ? new Date(selectedItem.dateLostOrFound).toLocaleDateString()
                    : ''}
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Registered By:</strong>
                <div>{selectedItem.userEmail}</div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Location:</strong>
                <div>{selectedItem.location}</div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Item ID:</strong>
                <div>{selectedItem.itemID}</div>
              </div>
            </div>

            <p style={{
              textAlign: 'center',
              fontSize: '16px',
              color: '#666',
              margin: '10px 0'
            }}>
              Are you sure you want to claim this item?
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px'
            }}>
             {/* <button
                onClick={handleClaimItem}
                style={{
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Confirm Claim
              </button>*/}
              <button
                onClick={handleCloseClaimPopup}
                style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
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

export default ItemManagement;
