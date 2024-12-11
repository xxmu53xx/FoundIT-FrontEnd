import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  
  const INITIAL_USER_STATE = {
    schoolEmail: '',
    schoolId: '',
    password: '',
    bio: '',
    currentPoints: 0,
    isAdmin: false,
    image: ''
  };

  const [user, setUser] = useState(INITIAL_USER_STATE);

  const API_BASE_URL = 'http://localhost:8083/api/users';

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getAllUsers`);
      setUsers(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching users');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Image rendering with zoom functionality
  const renderItemImage = useCallback((user) => {
    if (user.image) {
      return (
        <img
          src={user.image}
          alt="User Profile"
          onClick={() => setZoomedImage(user.image)}
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '4px',
            border: '1px solid #ddd',
            cursor: 'pointer'
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
        fontSize: '12px'
      }}>
        No Image
      </div>
    );
  }, []);

  const togglePopup = useCallback(() => {
    setShowPopup(prev => !prev);
    if (!showPopup) {
      resetUserForm();
    }
  }, [showPopup]);

  const resetUserForm = () => {
    setIsEditing(false);
    setUser(INITIAL_USER_STATE);
  };

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5_000_000) {
      setError('File is too large. Please choose an image under 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser(prev => ({
        ...prev,
        image: reader.result
      }));
      setError(null);
    };

    reader.onerror = () => {
      setError('Error reading file');
    };

    reader.readAsDataURL(file);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: type === 'checkbox' ? checked : 
             type === 'number' ? Number(value) : value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const endpoint = isEditing 
        ? `${API_BASE_URL}/putUserDetails/${user.userID}` 
        : `${API_BASE_URL}/postUsers`;
      
      const method = isEditing ? axios.put : axios.post;
      const response = await method(endpoint, user);
      
      const updatedUser = response.data;
      
      setUsers(prev => 
        isEditing 
          ? prev.map(u => u.userID === updatedUser.userID ? updatedUser : u)
          : [...prev, updatedUser]
      );
      
      togglePopup();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving user');
    }
  }, [isEditing, user, togglePopup]);

  const handleEdit = useCallback((userToEdit) => {
    setUser(userToEdit);
    setIsEditing(true);
    setShowPopup(true);
  }, []);

  const handleDelete = useCallback(async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_BASE_URL}/deleteUserDetails/${userId}`);
        setUsers(prev => prev.filter(u => u.userID !== userId));
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting user');
      }
    }
  }, []);

  const filteredUsers = useMemo(() => {
    const searchTermLower = searchTerm.toLowerCase();
    return users.filter(user => 
      ['schoolEmail', 'schoolId', 'bio', 'userID', 'currentPoints']
        .some(field => 
          String(user[field])
            .toLowerCase()
            .includes(searchTermLower)
        )
    );
  }, [users, searchTerm]);

  // Close zoomed image when clicking outside
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setZoomedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="content">
      {/* Zoomed Image Modal */}
      {zoomedImage && (
        <div 
        className="zoom-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setZoomedImage(null)}
        >
          <img 
            src={zoomedImage} 
            alt="Zoomed" 
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain'
            }}
          />
        </div>
      )}

      <div className="content-header">
        <h1>User Management</h1>
        <div className="coheader">
          <input 
            type="text" 
            className="search-bar" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={togglePopup} className="add-button1">
            <h6>+ Add User</h6>
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr className="labellist">
              <th className="user-id-column">USER ID</th>
              <th>Picture</th>
              <th>SCHOOL EMAIL</th>
              <th>SCHOOL ID</th>
              <th>BIO</th>
              <th className="cp-column">CP</th>
              <th>isAdmin</th>
              <th className="actions-column">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.userID}>
                <td>{user.userID}</td>
                <td>{renderItemImage(user)}</td>
                <td>{user.schoolEmail}</td>
                <td className="Schoolid">{user.schoolId}</td>
                <td className="bio">{user.bio}</td>
                <td className="cp-column">{user.currentPoints}</td>
                <td className="bio">{user.isAdmin ? 'True' : 'False'}</td>
                <td className="actions-column">
                  <button 
                    className="edit-btn" 
                    onClick={() => handleEdit(user)}
                  >
                    <EditIcon />
                  </button>
                  <button 
                    className="delete-btn" 
                    onClick={() => handleDelete(user.userID)}
                  >
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div className="modal-overlay" onClick={togglePopup}>
          <div className="popup1" onClick={(e) => e.stopPropagation()}>
            <h2>{isEditing ? 'Edit User' : 'Create New User'}</h2>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group">
                <label>Email:
                  <input
                    type="email"
                    name="schoolEmail"
                    value={user.schoolEmail}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-group">
                <label>School ID:
                  <input
                    type="text"
                    name="schoolId"
                    value={user.schoolId}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-group">
                <label>Password:
                  <input
                    type="password"
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-group">
                <label>Bio:
                  <textarea
                    className="textArea"
                    name="bio"
                    value={user.bio}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-group">
                <label>Current Points:
                  <input
                    className="currentPoints"
                    type="number"
                    name="currentPoints"
                    value={user.currentPoints}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

                <label>Is Admin </label>
                  <input
                    type="checkbox"
                    name="isAdmin"
                    checked={user.isAdmin}
                    onChange={handleChange}
                  />
                  

              <div className="form-group">
                <label>Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
               
              </div>

              <div className="form-buttons">
                <button type="submit" className="edit-btn">
                  {isEditing ? 'Update User' : 'Create User'}
                </button>
                <button 
                  type="button" 
                  className="delete-btn" 
                  onClick={togglePopup}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;