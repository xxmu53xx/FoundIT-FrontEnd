import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Rewards.css';

const Points = () => {
  const [points, setPoints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    pointsEarned: '',
    dateEarned: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPoints();
  }, []);

  const fetchPoints = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/points/getAllPoints');
      setPoints(response.data);
    } catch (error) {
      console.error('Error fetching points:', error);
      setError('Failed to fetch points');
    }
  };

  const handleEdit = (point) => {
    setEditingPoint(point);
    setFormData({
      pointsEarned: point.pointsEarned.toString(),
      dateEarned: point.dateEarned
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

    const payload = {
      ...formData,
      pointsEarned: parseInt(formData.pointsEarned),
      ...(editingPoint && { pointId: editingPoint.pointId })
    };

    try {
      if (editingPoint) {
        const response = await axios.put(
          `http://localhost:8083/api/points/putPoint/${editingPoint.pointId}`,
          payload
        );
        if (response.status === 200) {
          setSuccessMessage('Point updated successfully!');
          fetchPoints();
          setTimeout(() => handleCloseModal(), 1500);
        }
      } else {
        const response = await axios.post(
          'http://localhost:8083/api/points/postPoints',
          payload
        );
        if (response.status === 201) {
          setSuccessMessage('Point created successfully!');
          fetchPoints();
          setTimeout(() => handleCloseModal(), 1500);
        }
      }
    } catch (error) {
      console.error('Error saving point:', error);
      setError(error.response?.data?.message || 'Failed to save point. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this point?')) {
      try {
        const response = await axios.delete(`http://localhost:8083/api/points/deletePoints/${id}`);
        if (response.status === 204) {
          setSuccessMessage('Point deleted successfully!');
          fetchPoints();
        }
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
  
    });
    setError('');
    setSuccessMessage('');
  };
  const filteredPoints = points.filter(point => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      point.pointsEarned.toString().includes(searchTermLower) ||
      point.dateEarned.toLowerCase().includes(searchTermLower)
    );
  });
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  return (
    <div className="content">
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
        </button></div>
      </div>
      {/* Display error message if there is one */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Display success message if there is one */}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="table-container">
      <table className="points-table">
        <thead>
          <tr >
            <th>Points Earned</th>
            <th>Date Earned</th>
            <th>Earned By</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPoints.map((point) => (
            <tr key={point.pointId}>
              <td>{point.pointsEarned}</td>
              <td>{point.dateEarned}</td>
              <td>USER</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(point)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(point.pointId)}
                >
                  Delete
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
