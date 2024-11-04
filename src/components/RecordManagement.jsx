import { useState, useEffect } from 'react';
import { BrowserRouter as Router, NavLink } from 'react-router-dom';
import './Design.css'
import './User';
function Records() {
  const [users, setUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    schoolEmail: '',
    schoolId: '',
    password: '',
    bio: '',
    currentPoints: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:8083/api/users/getAllUsers');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        setError('Error fetching users');
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
      const url = isEditing
        ? `http://localhost:8083/api/users/putUserDetails/${user.userID}`
        : 'http://localhost:8083/api/users/postUsers';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      }); 
      const updatedUser = await response.json();
      
      if (isEditing) {
        setUsers(users.map(u => u.userID === updatedUser.userID ? updatedUser : u));
      } else {
        setUsers([...users, updatedUser]);
      }
      togglePopup();
    } catch (error) {
      setError('Error saving user');
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
        await fetch(`http://localhost:8083/api/users/deleteUserDetails/${userId}`, {
          method: 'DELETE',
        });
        setUsers(users.filter(u => u.userID !== userId));
      } catch (error) {
        setError('Error deleting user');
      }
    }
  };

  return (
        <div className="content">
          <div className="content-header">
            <h1>Reward Management</h1>
            <button onClick={togglePopup} className="add-button1" title="Add User"><h6>+ Add User</h6></button>
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
                {users.map((user) => (
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
            <div className="modal-overlay" onClick={togglePopup}>
              <div className="popup" onClick={(e) => e.stopPropagation()}>
                <h2>{isEditing ? 'Edit User' : 'Create New User'}</h2>
                <form onSubmit={handleSubmit} className="user-form">
                  <div className="form-group">
                    <label>Email:</label>
                    <input type="text" name="schoolEmail" value={user.schoolEmail} onChange={handleChange} required />
                  </div>
                  {/* Other form fields */}
                  <div className="form-buttons">
                    <button type="submit" className="edit-btn">{isEditing ? 'Update User' : 'Create User'}</button>
                    <button type="button" className="delete-btn" onClick={togglePopup}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
  
  );
}

export default Records;
