import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Design.css';
import './Item.css';

function ItemManagement() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
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
    
      // Sort items by date in descending order (latest first)
      const sortedItems = enhancedItems.sort((a, b) => 
        new Date(b.dateLostOrFound) - new Date(a.dateLostOrFound)
      );
    
      setItems(sortedItems);
      setUsers(usersData);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching items and users');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const togglePopup = () => {
    setShowPopup(!showPopup);
    if (!showPopup) {
      setItem({
        description: '',
        dateLostOrFound: '',
        userId: '',
        location: '',
        status: 'Found',
        image: ''
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!item.userId) {
        setError('Please select a user');
        return;
      }

      const itemData = {
        ...item,
        dateLostOrFound: new Date(item.dateLostOrFound).toISOString(),
        user: {
          userID: parseInt(item.userId)
        },
        userEmail: undefined
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
      setError(`Error creating item: ${error.message}`);
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
            border: '1px solid #ddd'
          }}
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
      !statusFilter || item.status.toLowerCase() === statusFilter.toLowerCase();
  
    return matchesSearchTerm && matchesStatus;
  });

  return (
    <div className="content">
      <br></br>
      <div className="content-header">
        <h1>Current Items Pending</h1>
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

      <div className="horizontal-scroll-container">
        {filteredItems.map((item) => (
          <div className="item-card" key={item.itemID}>
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Date:</strong> {new Date(item.dateLostOrFound).toLocaleDateString()}</p>
            <p><strong>Registered By:</strong> {item.userEmail}</p>
            <p><strong>Location:</strong> {item.location}</p>
            {renderItemImage(item)}
            <p><strong>Status:</strong> {item.status}</p>
          </div>
        ))}
      </div>

      {showPopup && (
        <div className="modal-overlay1" onClick={togglePopup}>
          <div
            className="popup1"
            onClick={(e) => e.stopPropagation()}
            style={{ height: '700px', width: '500px' }}
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
                <select
                  className="dropdown"
                  name="userId"
                  value={item.userId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.userID} value={user.userID}>
                      {user.schoolEmail}
                    </option>
                  ))}
                </select>
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
                <label>Image (5MB MAX):</label>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                {item.image && <img src={item.image} alt="Preview" className="image-preview" />}
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