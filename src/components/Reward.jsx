import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './Design.css'

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    rewardName: '',
    rewardType: '',
    pointsRequired: '',
    isClaimed: false,
    code:''
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
      pointsRequired: reward.pointsRequired.toString(),
      isClaimed: reward.isClaimed,
      code:reward.couponCode
      
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
      rewardName: formData.rewardName,
      rewardType: formData.rewardType,
      pointsRequired: parseInt(formData.pointsRequired),
      user: { userID: 1 },  // Make sure you dynamically set this to the correct userID
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
        setSuccessMessage('Reward deleted successfully!');
        fetchRewards();
      } catch (error) {
        console.error('Error deleting reward:', error);
        setError(error.response?.data?.message || 'Failed to delete reward');
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
  const filteredRewards = rewards.filter(reward => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      reward.rewardName.toLowerCase().includes(searchTermLower) ||
      reward.rewardType.toLowerCase().includes(searchTermLower) ||
      reward.pointsRequired.toString().includes(searchTermLower)
    );
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  return (
    <div className="content">
       <br></br>
      <div className="content-header">
        <h1>Reward Management</h1>
        
        <div className="coheader">
        <input 
          type="text" 
          className="search-bar" 
          placeholder="Search..." 
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={() => setShowModal(true)} className="add-button1" title="Add User">
          <h6>+ Add Reward</h6>
        </button></div>
      </div>
      {/* Display error message if there is one */}
      {error && <div className="error-message">{error}</div>}
      
      {/* Display success message if there is one */}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="table-container">
      <table>
        <thead>
          <tr className="labellist">
            <th>REWARD ID</th>
            <th>Reward Name</th>
            <th>Reward Type</th>
            <th>Points Required</th>
            <th>isClaimed</th>
            <th>Claimed By</th>
            <th>Code</th>
            <th className="actions-column">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {filteredRewards.map((reward) => (
            <tr key={reward.rewardId}>
              <td>{reward.rewardId}</td>
              <td>{reward.rewardName}</td>
              <td>{reward.rewardType}</td>
              <td>{reward.pointsRequired}</td>
      
              <td>{reward?.isClaimed? 'True' : 'False'}</td>
              <td>if true display user here</td>
              <td>{reward.couponCode}</td>
              <td className="actions-column">
                <button 
                  className="edit-btn" 
                  onClick={() => handleEdit(reward)}
                >
                  <EditIcon />
                </button>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(reward.rewardId)}
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
            
              <div className="modal-buttons">
                <button type="submit" className="edit-btn">
                  {editingReward ? 'Update' : 'Add'}
                </button>
                <button type="button" className="delete-btn" onClick={handleCloseModal}>
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