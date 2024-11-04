import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Rewards.css';

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [formData, setFormData] = useState({
    rewardName: '',
    rewardType: '',
    pointsRequired: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/rewards/getAllRewards');
      setRewards(response.data);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setError('Failed to fetch rewards');
    }
  };

  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      rewardName: reward.rewardName,
      rewardType: reward.rewardType,
      pointsRequired: reward.pointsRequired.toString()
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
      pointsRequired: parseInt(formData.pointsRequired),
      ...(editingReward && { rewardId: editingReward.rewardId })
    };

    try {
      if (editingReward) {
        // Fix: Change port from 8080 to 8083
        const response = await axios.put(
          `http://localhost:8083/api/rewards/putReward/${editingReward.rewardId}`,
          payload
        );
        if (response.status === 200) {
          setSuccessMessage('Reward updated successfully!');
          fetchRewards();
          setTimeout(() => handleCloseModal(), 1500);
        }
      } else {
        const response = await axios.post(
          'http://localhost:8083/api/rewards/postRewards',
          payload
        );
        if (response.status === 201) {
          setSuccessMessage('Reward created successfully!');
          fetchRewards();
          setTimeout(() => handleCloseModal(), 1500);
        }
      }
    } catch (error) {
      console.error('Error saving reward:', error);
      setError(error.response?.data?.message || 'Failed to save reward. Please try again.');
    }
};

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      try {
        const response = await axios.delete(`http://localhost:8083/api/rewards/deleteRewards/${id}`);
        if (response.status === 204) {
          setSuccessMessage('Reward deleted successfully!');
          fetchRewards();
        }
      } catch (error) {
        console.error('Error deleting reward:', error);
        setError('Failed to delete reward');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingReward(null);
    setFormData({
      rewardName: '',
      rewardType: '',
      pointsRequired: ''
    });
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="rewards-container">
      <h1>REDEEM REWARDS</h1>
      
      <button className="add-button" onClick={() => setShowModal(true)}>
        Add Reward
      </button>

      {/* Display error message if there is one */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Display success message if there is one */}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="rewards-grid">
        {rewards.map((reward) => (
          <div key={reward.rewardId} className="reward-card">
            <h3>{reward.rewardName}</h3>
            <p>Reward Type: {reward.rewardType}</p>
            <div className="points-container">
              <span className="points-icon">★</span>
              <span>{reward.pointsRequired}</span>
              <button className="redeem-button">Redeem</button>
            </div>
            <div className="button-container">
              <button className="edit-button" onClick={() => handleEdit(reward)}>
                Edit
              </button>
              <button className="delete-button" onClick={() => handleDelete(reward.rewardId)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{editingReward ? 'Edit Reward' : 'Add Reward'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Reward Name:</label>
                <input
                  type="text"
                  name="rewardName"
                  value={formData.rewardName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Reward Type:</label>
                <input
                  type="text"
                  name="rewardType"
                  value={formData.rewardType}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Points Required:</label>
                <input
                  type="number"
                  name="pointsRequired"
                  value={formData.pointsRequired}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              {successMessage && <div className="success-message">{successMessage}</div>}
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  {editingReward ? 'Update' : 'Add'}
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

export default Rewards;