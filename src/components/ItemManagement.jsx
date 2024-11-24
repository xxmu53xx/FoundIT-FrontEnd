import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Rewards.css';

const Items = () => {
  const [items, setItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    dateLostOrFound: '',
    registeredBy: '',
    location: '',
    userId: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    setCurrentUser(user);
    fetchUsers();
    
    const intervalId = setInterval(() => {
      fetchUsers();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/users/getAllUsers');
      setUsers(response.data);
      
      const allItems = [];
      response.data.forEach(user => {
        if (user.items) {
          const userItems = user.items.map(item => ({
            ...item,
            userEmail: user.schoolEmail,
            userId: user.userID
          }));
          allItems.push(...userItems);
        }
      });
      
      // Sort items by itemId in descending order
      allItems.sort((a, b) => b.itemId - a.itemId);
      // Remove any potential duplicates based on itemId
      const uniqueItems = Array.from(new Map(allItems.map(item => [item.itemId, item])).values());
      setItems(uniqueItems);
    } catch (error) {
      console.error('Error fetching users and items:', error);
      setError('Failed to fetch data');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      description: item.description,
      dateLostOrFound: new Date(item.dateLostOrFound).toISOString().split('T')[0],
      registeredBy: item.registeredBy,
      location: item.location,
      userId: item.userId.toString()
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.userId) {
      setError('Please select a user');
      return;
    }

    const payload = {
      itemId: editingItem?.itemId, // Include the itemId for updates
      description: formData.description,
      dateLostOrFound: new Date(formData.dateLostOrFound).toISOString(),
      registeredBy: formData.registeredBy,
      location: formData.location,
      user: {
        userID: parseInt(formData.userId)
      }
    };

    try {
      if (editingItem) {
        // Include the itemId in the payload and ensure it's a PUT request
        const response = await axios.put(
          `http://localhost:8083/api/items/putItem/${editingItem.itemId}`,
          payload,
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200 || response.status === 204) {
          // Only fetch the updated data after successful update
          await fetchUsers();
          setSuccessMessage('Item updated successfully!');
          setTimeout(() => {
            handleCloseModal();
            setSuccessMessage('');
          }, 1500);
        }
      } else {
        // Handle new item creation
        const response = await axios.post(
          'http://localhost:8083/api/items/postItems',
          payload
        );
        
        if (response.status === 201 || response.status === 200) {
          await fetchUsers();
          setSuccessMessage('Item created successfully!');
          setTimeout(() => {
            handleCloseModal();
            setSuccessMessage('');
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error saving item:', error);
      const errorMessage = error.response?.data?.message || 
                          'Failed to save item. Please try again.';
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`http://localhost:8083/api/items/deleteItems/${id}`);
        // Update items state locally
        setItems(prevItems => prevItems.filter(item => item.itemId !== id));
        setSuccessMessage('Item deleted successfully!');
      } catch (error) {
        console.error('Error deleting item:', error);
        setError('Failed to delete item');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      description: '',
      dateLostOrFound: '',
      registeredBy: '',
      location: '',
      userId: ''
    });
    setError('');
    setSuccessMessage('');
  };

  const filteredItems = items.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      item.description.toLowerCase().includes(searchTermLower) ||
      (item.dateLostOrFound && item.dateLostOrFound.toLowerCase().includes(searchTermLower)) ||
      (item.userEmail && item.userEmail.toLowerCase().includes(searchTermLower))
    );
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="content">
      <div className="content-header">
        <h1>Item Management</h1>
        <div className="coheader">
          <input 
            type="text" 
            className="search-bar" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={() => setShowModal(true)} className="add-button1" title="Add Item">
            <h6>+   Add Item</h6>
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="table-container">
        <table className="points-table">
          <thead>
            <tr>
              <th>ITEM ID</th>
              <th>Description</th>
              <th>Date Lost or Found</th>
              <th>Registered By</th>
              <th className="actions-column">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.itemId}>
                <td>{item.itemId}</td>
                <td>{item.description}</td>
                <td>{new Date(item.dateLostOrFound).toLocaleDateString()}</td>
                <td>{item.userEmail || 'Unassigned'}</td>
                <td className="actions-column">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.itemId)}
                  >
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingItem ? 'Edit Item' : 'Add Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date Lost or Found:</label>
                <input
                  type="date"
                  name="dateLostOrFound"
                  value={formData.dateLostOrFound}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Registered By:</label>
                <input
                  type="text"
                  name="registeredBy"
                  value={formData.registeredBy}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>User:</label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user.userID} value={user.userID}>
                      {user.schoolEmail}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={handleCloseModal} className="cancel-btn">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Items;
