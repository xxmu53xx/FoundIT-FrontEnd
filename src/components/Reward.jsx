import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './Design.css'

import './Rewards.css';
const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [registeredByFilter, setRegisteredByFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    rewardName: '',
    rewardType: '',
    pointsRequired: '',
    isClaimed: false,
    code:'',
    image:''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  useEffect(() => {
    fetchRewardsAndUsers();
  }, []);


  const fetchRewardsAndUsers = async () => {
    try {
      const [rewardsResponse, usersResponse] = await Promise.all([
        axios.get('http://localhost:8083/api/rewards/getAllRewards'),
        axios.get('http://localhost:8083/api/users/getAllUsers')
      ]);

      const rewardsData = rewardsResponse.data;
      const usersData = usersResponse.data;

      // Filter rewards if needed (e.g., only unclaimed rewards)
      // const filteredRewards = rewardsData.filter(reward => !reward.isClaimed);

      // Map rewards to include user email based on the user who claimed the reward
      const enhancedRewards = rewardsData.map(reward => {
        const associatedUser  = usersData.find(user =>
          user.rewards.some(userReward => userReward.rewardId === reward.rewardId)
        );

        return {
          ...reward,
          userEmail: associatedUser  ? associatedUser.schoolEmail : 'Unassigned', // Use schoolEmail for userEmail
          userId: associatedUser  ? associatedUser.userID : null // Ensure userId is set
        };
      });

      setRewards(enhancedRewards);
      setUsers(usersData);
      setError(null);
    } catch (error) {
      console.error('Error fetching rewards and users:', error);
      setError('Failed to fetch rewards and users');
    }
  };
 
  const handleEdit = (reward) => {
    setEditingReward(reward);
    setFormData({
      rewardName: reward.rewardName,
      rewardType: reward.rewardType,
      pointsRequired: reward.pointsRequired.toString(),
      isClaimed: reward.isClaimed,
      code: reward.couponCode,
      image: reward.image || '' // Set image for editing
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
      user: { userID: 3 },
      //this UserID is the temporary holder of the reward that is unclaimed
      //admin must be the temporary holder
      ...(editingReward && { rewardId: editingReward.rewardId }),
      ...(formData.image && { image: formData.image }) // Include image in payload
    };
  
    try {
      if (editingReward) {
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
    const matchesSearchTerm =
      reward.rewardName.toLowerCase().includes(searchTermLower) ||
      reward.rewardType.toLowerCase().includes(searchTermLower) ||
      reward.pointsRequired.toString().includes(searchTermLower);
  
    const matchesRegisteredBy =
      !registeredByFilter || reward.userId === Number(registeredByFilter); // Check if registeredByFilter is set
  
    return matchesSearchTerm && matchesRegisteredBy; // Combine both filters
  });
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
        setFormData(prev => ({
          ...prev,
          image: reader.result // Store the image in formData
        }));
        setError(null);
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  };

  
  const renderItemImage = (reward) => {
    if (reward.image) {
      return (
        <img
          src={reward.image}
          alt="Reward"
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
          onError={(e) => {
            console.error(`Image load error for reward ${reward.rewardId}`);
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

  return (
    <div className="content">
       <br></br>
      <div className="content-header">
        <h1>Reward Management</h1>
  
        <div className="coheader">
        <select
            className="status-dropdown"
            value={registeredByFilter}
            onChange={(e) => setRegisteredByFilter(e.target.value)}
          >
            <option value="">All User</option>
            {users.map((user) => (
              <option key={user.userID} value={user.userID}>
                {user.schoolEmail}
              </option>
            ))}
          </select>
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
            <th>Image</th>
            <th>Used</th>
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
      
              <td>{reward?.isClaimed? 'Claimed' : 'Unclaimed'}</td>
              <td>{reward?.isClaimed?  reward.userEmail : 'Not yet claimed'}</td>
              <td>{reward.couponCode}</td>
              <td>{renderItemImage(reward)}</td>
              <td>{reward?.isUsed? 'Used' : 'Not Used'}</td>
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

              
              <div className="form-group">
  <label>Image:</label>
  <input
    type="file"
    onChange={handleImageUpload}
    accept="image/*"
  />
  {formData.image && (
    <img
      src={formData.image}
      alt="Preview"
      style={{ width: '100px', height: '100px', objectFit: 'cover', marginTop: '10px' }}
    />
  )}
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