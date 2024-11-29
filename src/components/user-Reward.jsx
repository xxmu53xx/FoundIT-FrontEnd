import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './user-Reward.css';
import './Rewards.css'

const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sortOrder, setSortOrder] = useState('pricelow');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchRewards();
    fetchCurrentUser();
  }, [sortOrder]);

  const fetchRewards = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/rewards/getAllRewards');
      let fetchedRewards = response.data;

      // Filter out claimed rewards
      fetchedRewards = fetchedRewards.filter(reward => !reward.isClaimed);

      // Sort the rewards based on the selected sort order
      if (sortOrder === 'pricelow') {
        fetchedRewards.sort((a, b) => a.pointsRequired - b.pointsRequired);
      } else if (sortOrder === 'pricehigh') {
        fetchedRewards.sort((a, b) => b.pointsRequired - a.pointsRequired);
      }

      setRewards(fetchedRewards);
    } catch (error) {
      console.error('Error fetching rewards:', error);
      setError('Failed to fetch rewards');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const response = await axios.get(`http://localhost:8083/api/users/getUserByEmail/${userData.schoolEmail}`);
        setCurrentUser(response.data);
      } else {
        setError('No user found in local storage');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setError('Failed to fetch user details');
    }
  };

  const toggleWishlist = (reward) => {
    if (wishlist.find(item => item.rewardId === reward.rewardId)) {
      setWishlist(wishlist.filter(item => item.rewardId !== reward.rewardId));
    } else {
      setWishlist([...wishlist, reward]);
    }
  };

  const handleSortOrder = (event) => {
    setSortOrder(event.target.value);
  };

  const openWishlistModal = (reward) => {
    setSelectedReward(reward);
    setShowWishlistModal(true);
  };

  const handleRedeem = async (reward) => {
    // Check if user has enough points
    if (!currentUser) {
      setError('Please log in to redeem rewards');
      return;
    }

    if (currentUser.currentPoints < reward.pointsRequired) {
      setError(`You do not have enough points to redeem ${reward.rewardName}. Required: ${reward.pointsRequired}, Current: ${currentUser.currentPoints}`);
      return;
    }

    try {
      // Prepare the updated user object with deducted points
      const updatedUser = {
        ...currentUser,
        currentPoints: currentUser.currentPoints - reward.pointsRequired
      };

      // Update user points
      const userResponse = await axios.put(
        `http://localhost:8083/api/users/putUserDetails/${currentUser.userID}`, 
        updatedUser
      );

      // Update reward to mark as claimed and associate with user
      const rewardResponse = await axios.put(
        `http://localhost:8083/api/rewards/putReward/${reward.rewardId}`,
        {
          ...reward,
          isClaimed: true,
          user: updatedUser
        }
      );

      const updateEvent = new CustomEvent('userPointsUpdated', { 
        detail: { 
          newPoints: updatedUser.currentPoints 
        } 
      });
      window.dispatchEvent(updateEvent);

      // Update local state
      setCurrentUser(userResponse.data);
      setSuccessMessage(`Successfully redeemed ${reward.rewardName}!`);
      setShowWishlistModal(false);
      
      // Refresh rewards and user data
      fetchRewards();
      fetchCurrentUser();

    } catch (error) {
      console.error('Error redeeming reward:', error);
      setError('Failed to redeem reward. Please try again.');
    }
  };

  const renderItemImage = (reward) => {
    if (reward.image) {
      return (
        <img
          src={reward.image}
          alt="Reward"
          style={{
            marginTop:'20px',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10%',
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
      <img
      src="/NoImage.png"
      alt="Reward"
      style={{
        width: '500px',
        height: '100%',
        objectFit: 'cover',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        border: '1px solid #ddd'
      }}
      onError={(e) => {
        console.error(`Image load error for reward ${reward.rewardId}`);
        e.target.style.display = 'none';
      }}
    />
    );
  };

  return (
    <div className="content">
      <div className="header-container">
        <h1>REDEEM REWARDS</h1>
        <div className="user-points">
        </div>
        <br /><br /><br /><br /><br /><br />
        <select value={sortOrder} onChange={handleSortOrder} className="status-dropdown ">
          <option value="pricelow">Price: Low to High</option>
          <option value="pricehigh">Price: High to Low</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="rewards-grid">
        {rewards.map((reward) => (
          <div key={reward.rewardId} className="reward-card" onClick={() => openWishlistModal(reward)}>
            <div className="reward-image">
              {renderItemImage(reward)}
              <div className="reward-type">⭐{reward.pointsRequired}</div>
            </div>
            <h3>{reward.rewardName}</h3>
            <p className="RewardType">{reward.rewardType}</p>
            <div className="wishlist-icon" onClick={(e) => { e.stopPropagation(); toggleWishlist(reward); }}>
              {wishlist.find(item => item.rewardId === reward.rewardId)
                ? <FavoriteIcon className="wished" />
                : <FavoriteBorderIcon />}
            </div>
          </div>
        ))}
      </div>

      {/* Wishlist Modal */}
      {showWishlistModal && (
        <div className="modal-overlay">
          <div className="wishlist-modal">
            <div className="modal-content">
              {selectedReward && (
                <>
                  <div className="modal-image">
                    {/* Replace the default image with the selected reward's image */}
                    <img 
                      src={selectedReward.image || "/NoImage.png"} 
                      onError={(e) => {
                        e.target.src = "/dilao.png";
                        console.warn(`Error loading image for ${selectedReward.rewardName}, using default`);
                      }}
                    />
                  </div>
                  <div className="modal-info">  
                    <h2>{selectedReward.rewardName}</h2>
                    <p>★ {selectedReward.pointsRequired} point/s</p>
                    <p>Current Points: {currentUser?.currentPoints || 0}</p>
                    
                    <button
                      className="redeem-button"
                      onClick={() => handleRedeem(selectedReward)}
                      disabled={!currentUser || currentUser.currentPoints < selectedReward.pointsRequired}
                    >
                      <ShoppingCartIcon /> REDEEM NOW
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              className="close-button"
              onClick={() => setShowWishlistModal(false)}
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;