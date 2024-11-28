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

  useEffect(() => {
    fetchRewards();
  }, [sortOrder]);

  const fetchRewards = async () => {
    try {
      const response = await axios.get('http://localhost:8083/api/rewards/getAllRewards');
      let fetchedRewards = response.data;

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

  return (
    <div className="content">
      <div className="header-container">
        <h1>REDEEM REWARDS</h1>
        <br /><br /><br /><br /><br /><br />
        <select value={sortOrder} onChange={handleSortOrder} className="status-dropdown">
          <option value="pricelow">Price: Low to High</option>
          <option value="pricehigh">Price: High to Low</option>
        </select>
      </div>

      <div className="wishlist-button-container">
        <button
          className="wishlist-button"
          onClick={() => setShowWishlistModal(true)}
        >
          <FavoriteIcon /> Wishlist ({wishlist.length})
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <div className="rewards-grid">
        {rewards.map((reward) => (
          <div key={reward.rewardId} className="reward-card" onClick={() => openWishlistModal(reward)}>
            <div className="reward-image">
              <img 
                src="/newadmin.png"
                alt={reward.rewardName}
              />
              <div className="reward-type">⭐{reward.pointsRequired}</div>
            </div>
            <h3>{reward.rewardName}</h3>
            <p className="RewardType">Reward type</p>
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
                    <img 
                      src="/newadmin.png" 
                      alt={selectedReward.rewardName} 
                    />
                  </div>
                  <div className="modal-info">
                    <h2>{selectedReward.rewardName}</h2>
                    <p>★ {selectedReward.pointsRequired} pointssss</p>
                    
                    
                    <button
                      className="redeem-button"
                      onClick={() => handleRedeem(selectedReward)}
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