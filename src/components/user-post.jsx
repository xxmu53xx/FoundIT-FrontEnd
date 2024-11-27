import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Design.css';
import './Item.css';

function ItemManagement({ user }) {

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [zoomedImage, setZoomedImage] = useState(null); // State for the zoomed image
  const [newItem, setNewItem] = useState({
    description: '',
    dateLostOrFound: '',
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
  
      const itemsData = Array.isArray(itemsResponse.data) ? itemsResponse.data : [];
      const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : [];
  
      // Filter the items to only include those that belong to the current user
      const userItems = itemsData.filter(item => 
        usersData.some(user => user.userID === userID && user.items.some(userItem => userItem.itemID === item.itemID))
      );
  
      const enhancedItems = userItems.map(item => {
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
      setItems([]); // Ensure `items` is reset to an empty array on error
    }
  };useEffect(() => {
    if (user && Array.isArray(user.items)) {
      try {
        const sortedItems = [...user.items].sort((a, b) =>
          new Date(b.dateLostOrFound) - new Date(a.dateLostOrFound)
        );
        setItems(sortedItems);
        setError(null);
      } catch (err) {
        console.error('Error processing items:', err);
        setError('Error loading your items');
        setItems([]); // Reset `items` to an empty array on error
      }
    } else {
      setError('No items found for this user');
      setItems([]); // Ensure `items` is always an array
    }
  }, [user]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredItems = Array.isArray(items) ? items.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm =
      (item.dateLostOrFound && item.dateLostOrFound.toString().includes(searchTermLower)) ||
      (item.description && item.description.toLowerCase().includes(searchTermLower)) ||
      (item.location && item.location.toLowerCase().includes(searchTermLower));
  
    const matchesStatus =
      !statusFilter || item.status.toLowerCase() === statusFilter.toLowerCase();
  
    return matchesSearchTerm && matchesStatus;
  }) : [];const togglePopup = () => {
    setShowPopup(!showPopup);
    if (!showPopup) {
      setNewItem({
        description: '',
        dateLostOrFound: '',
        location: '',
        status: 'Found',
        image: ''
      });
    }
  };

  const handleImageClick = (image) => {
    setZoomedImage(image);
  };

  const closeZoom = () => {
    setZoomedImage(null);
  };
  const handleDelete = async (itemID) => {
    try {
      // Send the delete request
      await axios.delete(`http://localhost:8083/api/items/deleteItemDetails/${itemID}`);
  
      // Remove the deleted item from the local state (optimistic UI update)
      setItems(prevItems => prevItems.filter(item => item.itemID !== itemID));
  
      // Optionally, you can re-fetch items if needed, but in this case, we're updating the state directly
      // await fetchItems(); // Unnecessary if items are being filtered correctly
  
    } catch (error) {
      console.error('Error deleting item:', error.message);
      setError('Error deleting item: ' + error.message);
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
            cursor: 'pointer',
          }}
          onClick={() => handleImageClick(item.image)}
          onError={(e) => {
            console.error(`Image load error for item ${item.itemID}`);
            e.target.style.display = 'none';
          }}
        />
      );
    }


    return (
      <div
        style={{
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
          textAlign: 'center',
        }}
      >
        No Image
      </div>
    );
  };
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError('File is too large. Please choose an image under 5MB.');
        return;
      }
  
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
  
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update the newItem state with the image (Base64)
        setNewItem(prevItem => ({
          ...prevItem,
          image: reader.result // Store the Base64 encoded image
        }));
        setError(null);
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  };const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!newItem.dateLostOrFound) {
        throw new Error('Date Lost/Found is required.');
      }
  
      const itemData = {
        ...newItem,
        dateLostOrFound: new Date(newItem.dateLostOrFound).toISOString(), // Convert to ISO format
        user: {
          userID: user.userID, // Associate with the logged-in user
        },
      };
  
      const response = await axios.post(
        'http://localhost:8083/api/items/postItem',
        itemData,
        { headers: { 'Content-Type': 'application/json' } }
      );
  
      if (response.status === 200 || response.status === 201) {
        await fetchItems(); // Refresh the items list
        togglePopup(); // Close the popup
        setError(null); // Reset error state
      }
    } catch (error) {
      console.error('Submission error:', error.message);
      setError('Error submitting item: ' + error.message);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  return (
    <div className="content">
      <br />
      <div className="content-header">
        <h1>Your Posts</h1>
        <div className="coheader">
          <select
            className="status-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Found">Found</option>
            <option value="Lost">Lost</option>
          </select>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
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
          You haven't posted any items yet.
        </div>
      ) : (
        <div className="horizontal-scroll-container">
          {filteredItems.map((item) => (
            <div className="item-card" key={item.itemID}>
              <p>
                <strong>Description:</strong> {item.description}
              </p>
              <p>
                <strong>Date:</strong>{' '}
                {new Date(item.dateLostOrFound).toLocaleDateString()}
              </p>
              <p>
                <strong>Location:</strong> {item.location}
              </p>
              {renderItemImage(item)}
              <p>
                <strong>Status:</strong> {item.status}
              </p>
              <button
                className="delete-btn"
                onClick={() => handleDelete(item.itemID)}
              >
                Delete
              </button>
            </div>
            
          ))}
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
      value={newItem.description}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label>Date Lost/Found:</label>
    <input
      type="date"
      name="dateLostOrFound"
      value={newItem.dateLostOrFound}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label>Registered By:</label>
    <input type="text" value={user.schoolEmail} disabled />
  </div>

  <div className="form-group">
    <label>Location:</label>
    <input
      type="text"
      name="location"
      value={newItem.location}
      onChange={handleChange}
      required
    />
  </div>

  <div className="form-group">
    <label>Status:</label>
    <select
      className="dropdown"
      name="status"
      value={newItem.status}
      onChange={handleChange}
    >
      <option value="Found">Found</option>
      <option value="Lost">Lost</option>
    </select>
  </div>

  <div className="form-group">
    <label>Image (5MB MAX) (Optional):</label>
    <input type="file" onChange={handleImageUpload} accept="image/*" />
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

      
    </div>
  );
}

export default ItemManagement;
