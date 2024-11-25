import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Rewards.css';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
  const Points = () => {
    const [points, setPoints] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [editingPoint, setEditingPoint] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
      pointsEarned: '',
      dateEarned: '',
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
        
        const allPoints = [];
        response.data.forEach(user => {
          if (user.points) {
            const userPoints = user.points.map(point => ({
              ...point,
              userEmail: user.schoolEmail,
              userId: user.userID
            }));
            allPoints.push(...userPoints);
          }
        });
        
        // Sort points by pointId in descending order
        allPoints.sort((a, b) => b.pointId - a.pointId);
        // Remove any potential duplicates based on pointId
        const uniquePoints = Array.from(new Map(allPoints.map(point => [point.pointId, point])).values());
        setPoints(uniquePoints);
      } catch (error) {
        console.error('Error fetching users and points:', error);
        setError('Failed to fetch data');
      }
    };

    const handleEdit = (point) => {
      setEditingPoint(point);
      setFormData({
        pointsEarned: point.pointsEarned.toString(),
        dateEarned: new Date(point.dateEarned).toISOString().split('T')[0],
        userId: point.userId.toString()
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
        pointId: editingPoint?.pointId, // Include the pointId for updates
        pointsEarned: parseInt(formData.pointsEarned),
        dateEarned: new Date(formData.dateEarned).toISOString(),
        user: {
          userID: parseInt(formData.userId)
        }
      };

      try {
        if (editingPoint) {
          // Include the pointId in the payload and ensure it's a PUT request
          const response = await axios.put(
            `http://localhost:8083/api/points/putPoint/${editingPoint.pointId}`,
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
            setSuccessMessage('Point updated successfully!');
            setTimeout(() => {
              handleCloseModal();
              setSuccessMessage('');
            }, 1500);
          }
        } else {
          // Handle new point creation
          const response = await axios.post(
            'http://localhost:8083/api/points/postPoints',
            payload
          );
          
          if (response.status === 201 || response.status === 200) {
            await fetchUsers();
            setSuccessMessage('Point created successfully!');
            setTimeout(() => {
              handleCloseModal();
              setSuccessMessage('');
            }, 1500);
          }
        }
      } catch (error) {
        console.error('Error saving point:', error);
        const errorMessage = error.response?.data?.message || 
                            'Failed to save point. Please try again.';
        setError(errorMessage);
      }
    };
    const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to delete this point?')) {
        try {
          await axios.delete(`http://localhost:8083/api/points/deletePoints/${id}`);
          // Update points state locally
          setPoints(prevPoints => prevPoints.filter(point => point.pointId !== id));
          setSuccessMessage('Point deleted successfully!');
        } catch (error) {
          console.error('Error deleting point:', error);
          setError('Failed to delete point');
        }
      }
    };

    const handleCloseModal = () => {
      setShowModal(false);
      setEditingPoint(null);
      setFormData({
        pointsEarned: '',
        dateEarned: '',
        userId: ''
      });
      setError('');
      setSuccessMessage('');
    };

    const filteredPoints = points.filter(point => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        point.pointsEarned.toString().includes(searchTermLower) ||
        (point.dateEarned && point.dateEarned.toLowerCase().includes(searchTermLower)) ||
        (point.userEmail && point.userEmail.toLowerCase().includes(searchTermLower))
      );
    });

    const handleSearch = (e) => {
      setSearchTerm(e.target.value);
    };

  return (
    <div className="content">
       <br></br>
      <div className="content-header">
        <h1>Point Management</h1>
        <div className="coheader">
          <input 
            type="text" 
            className="search-bar" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={() => setShowModal(true)} className="add-button1" title="Add User">
            <h6>+   Add Point</h6>
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="table-container">
        <table className="points-table">
          <thead>
            <tr>
              <th>POINT ID</th>
              <th>Points Earned</th>
              <th>Date Earned</th>
              <th>Earned By</th>
              <th className="actions-column">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredPoints.map((point) => (
              <tr key={point.pointId}>
                <td>{point.pointId}</td>
                <td>{point.pointsEarned}</td>
                <td>{new Date(point.dateEarned).toLocaleDateString()}</td>
                <td>{point.userEmail || 'Unassigned'}</td>
                <td className="actions-column">
                  <button
                    className="edit-btn"
                    onClick={() => handleEdit(point)}
                  >
                     <EditIcon />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(point.pointId)}
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
            <h2>{editingPoint ? 'Edit Point' : 'Add Point'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Points Earned:</label>
                <input
                  type="number"
                  name="pointsEarned"
                  value={formData.pointsEarned}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Date Earned:</label>
                <input
                  type="date"
                  name="dateEarned"
                  value={formData.dateEarned}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Earned By:</label>
                <select
                  className="dropdown"
                  name="userId"
                  value={formData.userId}
                  onChange={handleInputChange}
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

              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              <div className="modal-buttons">
                <button type="submit" className="edit-btn">
                  {editingPoint ? 'Update' : 'Add'}
                </button>
                <button type="button" className="cancel-button" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Points;