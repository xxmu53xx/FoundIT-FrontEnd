import { useState, useEffect } from 'react';
import { BrowserRouter as Router, NavLink } from 'react-router-dom';
import axios from 'axios';
import './Design.css'

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState({
    schoolEmail: '',
    schoolId: '',
    password: '',
    bio: '',
    currentPoints: 0
  });
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:8083/api/users';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/getAllUsers`);
        setUsers(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching users');
      }
    };
    fetchUsers();
  }, []);

  const togglePopup = () => {
    setShowPopup(!showPopup);
    if (!showPopup) {
      setIsEditing(false);
      setUser({
        schoolEmail: '',
        schoolId: '',
        password: '',
        bio: '',
        currentPoints: 0
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isEditing) {
        response = await axios.put(
          `${API_BASE_URL}/putUserDetails/${user.userID}`,
          user
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/postUsers`,
          user
        );
      }
      
      const updatedUser = response.data;
      if (isEditing) {
        setUsers(users.map(u => u.userID === updatedUser.userID ? updatedUser : u));
      } else {
        setUsers([...users, updatedUser]);
      }
      togglePopup();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving user');
    }
  };

  const handleEdit = (userToEdit) => {
    setUser(userToEdit);
    setIsEditing(true);
    setShowPopup(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`${API_BASE_URL}/deleteUserDetails/${userId}`);
        setUsers(users.filter(u => u.userID !== userId));
      } catch (error) {
        setError(error.response?.data?.message || 'Error deleting user');
      }
    }
  };
  const filteredUsers = users.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.schoolEmail.toLowerCase().includes(searchTermLower) ||
      user.schoolId.toLowerCase().includes(searchTermLower) ||
      user.bio.toLowerCase().includes(searchTermLower) ||
      user.userID.toString().includes(searchTermLower) ||
      user.currentPoints.toString().includes(searchTermLower)
    );
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  return (
    <div className="content">
      <div className="content-header">
        <h1>User Management</h1>
        
        <div className="coheader">
        <input 
          type="text" 
          className="search-bar" 
          placeholder="Search..." 
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={togglePopup} className="add-button1" title="Add User">
          <h6>+ Add User</h6>
        </button></div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr className="labellist">
              <th className="user-id-column">USER ID</th>
              <th>SCHOOL EMAIL</th>
              <th>SCHOOL ID</th>
              <th>PASSWORD</th>
              <th>BIO</th>
              <th className="cp-column">CP</th>
              <th className="actions-column">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
          {filteredUsers.map((user) => (
         
              <tr key={user.userID}>
                <td>{user.userID}</td>
                <td>{user.schoolEmail}</td>
                <td className="Schoolid">{user.schoolId}</td>
                <td>•••••••</td>
                <td className="bio">{user.bio}</td>
                <td className="cp-column">{user.currentPoints}</td>
                <td className="actions-column">
                  <button className="edit-btn" onClick={() => handleEdit(user)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(user.userID)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div className="modal-overlay1" onClick={togglePopup}>
          <div className="popup1" onClick={(e) => e.stopPropagation()}>
            <h2>{isEditing ? 'Edit User' : 'Create New User'}</h2>
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-group1">
                <label>Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <input
                    type="email"
                    name="schoolEmail"
                    value={user.schoolEmail}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-group1">
                <label>School ID:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <input
                    type="text"
                    name="schoolId"
                    value={user.schoolId}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-group1">
                <label>Password:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  <input
                    type="text"
                    name="password"
                    value={user.password}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <div className="form-group1">
                <label>Bio:</label>
                <textarea
                  className="textArea"
                  name="bio"
                  value={user.bio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group1">
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

              <div className="form-buttons">
                <button type="submit" className="edit-btn">
                  {isEditing ? 'Update User' : 'Create User'}
                </button>
                <button type="button" className="delete-btn" onClick={togglePopup}>
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