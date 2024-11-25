import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import './user-Reward.css';
import './Design.css'
const Rewards = () => {
  const [rewards, setRewards] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [wishlist, setWishlist] = useState([]);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
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

  const toggleWishlist = (reward) => {
    if (wishlist.find(item => item.rewardId === reward.rewardId)) {
      setWishlist(wishlist.filter(item => item.rewardId !== reward.rewardId));
    } else {
      setWishlist([...wishlist, reward]);
    }
  };

  const handleRedeem = (reward) => {
    // Implement redeem functionality
    console.log('Redeeming:', reward);
  };

  const nextPage = () => {
    if ((currentPage + 1) * 4 < rewards.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getCurrentRewards = () => {
    const startIndex = currentPage * 4;
    return rewards.slice(startIndex, startIndex + 4);
  };

  const removeFromWishlist = (rewardId) => {
    setWishlist(wishlist.filter(item => item.rewardId !== rewardId));
  };

  return (
    <div className="content">
      <br></br><br></br>
      <h1>REDEEM REWARDS</h1>
      
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

      <div className="rewards-carousel">
        <button 
          className="nav-button prev" 
          onClick={prevPage}
          disabled={currentPage === 0}
        >
          <NavigateBeforeIcon sx={{ backgroundColor : '#800000'}}/>
        </button>

        <div className="rewards-grid">
          {getCurrentRewards().map((reward) => (
            <div key={reward.rewardId} className="reward-card">
              <div className="wishlist-icon" onClick={() => toggleWishlist(reward)}>
                {wishlist.find(item => item.rewardId === reward.rewardId) 
                  ? <FavoriteIcon className="wished" />
                  : <FavoriteBorderIcon />}
              </div>
              
              <h3>{reward.rewardName}</h3>
              <p className="reward-type">Type: {reward.rewardType}</p>
              
              <div className="points-container">
                <div className="stars">
                  {[...Array(Math.min(Math.ceil(reward.pointsRequired/100), 5))].map((_, i) => (
                    <span key={i} className="star-filled">★</span>
                  ))}
                  {[...Array(5 - Math.min(Math.ceil(reward.pointsRequired/100), 5))].map((_, i) => (
                    <span key={i} className="star-empty">☆</span>
                  ))}
                </div>
                <div className="price">
                  <span className="points">★ {reward.pointsRequired}</span>
                </div>
              </div>

              <button 
                className="redeem-button"
                onClick={() => handleRedeem(reward)}
              >
                <ShoppingCartIcon /> REDEEM NOW
              </button>
            </div>
          ))}
        </div>

        <button 
          className="nav-button next" 
          onClick={nextPage}
          disabled={(currentPage + 1) * 4 >= rewards.length}
        >
          <NavigateNextIcon sx={{ backgroundColor : '#800000'}}/>
        </button>
      </div>

      {/* Wishlist Modal */}
      {showWishlistModal && (
        <div className="modal-overlay">
          <div className="wishlist-modal">
            <div className="modal-header">
              <h2>My Wishlist</h2>
              <button 
                className="close-button"
                onClick={() => setShowWishlistModal(false)}
              >
                <CloseIcon />
              </button>
            </div>
            
            <div className="wishlist-items">
              {wishlist.length === 0 ? (
                <p>No items in wishlist</p>
              ) : (
                wishlist.map((reward) => (
                  <div key={reward.rewardId} className="wishlist-item">
                    <div className="wishlist-item-info">
                      <h3>{reward.rewardName}</h3>
                      <p>{reward.rewardType}</p>
                      <p>★ {reward.pointsRequired} points</p>
                    </div>
                    <div className="wishlist-item-actions">
                      <button 
                        className="redeem-button"
                        onClick={() => handleRedeem(reward)}
                      >
                        Redeem
                      </button>
                      <button 
                        className="remove-button"
                        onClick={() => removeFromWishlist(reward.rewardId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rewards;