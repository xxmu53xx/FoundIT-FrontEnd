import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Rewards.css';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
function ItemManagement() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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
    
      // Map user items to their corresponding user emails
      const enhancedItems = itemsData.map(item => {
        const associatedUser = usersData.find(user =>
          user.items.some(userItem => userItem.itemID === item.itemID)
        );
    
        return {
          ...item,
          userEmail: associatedUser ? associatedUser.schoolEmail : 'Unassigned'
        };
      });
    
      setItems(enhancedItems);
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
      setIsEditing(false);
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

      // Create the proper item data structure for the API
      const itemData = {
        ...item,
        dateLostOrFound: new Date(item.dateLostOrFound).toISOString(),
        // Ensure we're sending the complete user object structure
        user: {
          userID: parseInt(item.userId)
        },
        // Remove any extra fields that might cause issues
        userEmail: undefined
      };

      // If updating, make sure we include the itemID in the request body
      if (isEditing) {
        itemData.itemID = item.itemID;
      }

      const endpoint = isEditing 
        ? `http://localhost:8083/api/items/putItemDetails/${item.itemID}`
        : 'http://localhost:8083/api/items/postItem';

      const response = await axios({
        method: isEditing ? 'put' : 'post',
        url: endpoint,
        data: itemData,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 200 || response.status === 201) {
        await fetchItems(); // Refresh the list to get updated data
        togglePopup();
        setError(null);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setError(`Error ${isEditing ? 'updating' : 'creating'} item: ${error.message}`);
    }
  };

  const handleEdit = (itemToEdit) => {
    // Find the current user associated with the item
    const currentUser = users.find(user => 
      user.items.some(userItem => userItem.itemID === itemToEdit.itemID)
    );

    setItem({
      ...itemToEdit,
      dateLostOrFound: itemToEdit.dateLostOrFound ? itemToEdit.dateLostOrFound.split('T')[0] : '',
      // Set the userId from the current user, if found
      userId: currentUser ? currentUser.userID.toString() : '',
      userEmail: currentUser ? currentUser.schoolEmail : 'Unassigned'
    });
    setIsEditing(true);
    setShowPopup(true);
  };

  const handleDelete = async (itemID) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`http://localhost:8083/api/items/deleteItemDetails/${itemID}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete item');
        }

        setItems((prevItems) => prevItems.filter((i) => i.itemID !== itemID));
        setError(null);
      } catch (error) {
        console.error('Delete error:', error);
        setError(`Error deleting item: ${error.message}`);
      }
    }
  };

  const renderItemImage = (item) => {
    if (item.image) {
      return (
        <img
          src={item.image}
          alt="Item"
          style={{
            width: '60px',
            height: '60px',
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
        width: '60px',
        height: '60px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        display: 'flex',
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
      (item.user?.schoolEmail && item.user.schoolEmail.toLowerCase().includes(searchTermLower)) ||
      (item.location && item.location.toLowerCase().includes(searchTermLower));
  
    const matchesStatus =
      !statusFilter || item.status.toLowerCase() === statusFilter.toLowerCase();
  
    return matchesSearchTerm && matchesStatus;
  });

  return (
    <div className="content">
      <br></br>
      <div className="content-header">
        <h1>Item Management</h1>

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

      <div className="table-container">
      <table>
          <thead>
            <tr className="labellist">
              <th className="item-id-column">ITEM ID</th>
              <th>Description</th>
              <th>Date Lost/Found</th>
              <th>Registered By</th>
              <th>Location</th>
              <th>Status</th>
              <th>Image</th>
              <th className="actions-column">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.itemID}>
                <td>{item.itemID}</td>
                <td>{item.description}</td>
                <td>
                  {item.dateLostOrFound
                    ? new Date(item.dateLostOrFound).toLocaleDateString()
                    : ''}
                </td>
                <td>{item.userEmail}</td>
                <td>{item.location}</td>
                <td>{item.status}</td>
                <td>{renderItemImage(item)}</td>
                <td className="actions-column">
                  <button className="edit-btn" onClick={() => handleEdit(item)}>
                    <EditIcon />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.itemID)}
                  >
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space"></div>
      </div>

      {showPopup && (
        <div className="modal-overlay1" onClick={togglePopup}>
          <div
            className="popup1"
            onClick={(e) => e.stopPropagation()}
            style={{ height: 'auto', width: '500px' }}
          >
            <h2>{isEditing ? 'Edit Item' : 'Create New Item'}</h2>
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
                <label>Image:</label>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
              {/*{item.image && <img src={item.image} alt="Preview" className="image-preview" />}*/}
              </div>

              {error && <div className="error">{error}</div>}
<div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button type="submit" className="edit-btn" >
                {isEditing ? 'Update Item' : 'Add Item'}
              </button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemManagement;
