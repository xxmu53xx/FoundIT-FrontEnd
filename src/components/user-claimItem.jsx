import { useState, useEffect } from 'react';
import axios from 'axios';
import './Design.css';
import './Item.css';

function ItemManagement() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null); 

  const fetchData = async () => {
    try {
      const [itemsResponse, usersResponse] = await Promise.all([
        axios.get('http://localhost:8083/api/items/getAllItems'),
        axios.get('http://localhost:8083/api/users/getAllUsers')
      ]);
    
      const itemsData = itemsResponse.data;
      const usersData = usersResponse.data;
    
      const enhancedItems = itemsData
        .filter(item => item.status === 'Found')
        .map(item => {
          const associatedUser = usersData.find(user =>
            user.items.some(userItem => userItem.itemID === item.itemID)
          );
    
          return {
            ...item,
            userEmail: associatedUser ? associatedUser.schoolEmail : 'Unassigned'
          };
        });
    
      setItems(enhancedItems);
      setUsers(usersData);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching items and users');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaimClick = (itemData) => {
    setSelectedItem(itemData);
    setShowClaimPopup(true);
  };

  const handleCloseClaimPopup = () => {
    setShowClaimPopup(false);
    setSelectedItem(null);
  };

  const filteredItems = items.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (item.dateLostOrFound && item.dateLostOrFound.toString().toLowerCase().includes(searchTermLower)) ||
      (item.description && item.description.toLowerCase().includes(searchTermLower)) ||
      (item.userEmail && item.userEmail.toLowerCase().includes(searchTermLower)) ||
      (item.location && item.location.toLowerCase().includes(searchTermLower))
    );
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const renderItemImage = (item) => {
    if (item.image) {
      return (
        <img
          src={item.image}
          alt="Item"
          style={{
            width: '250px',
            height: '300px',
            objectFit: 'cover',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
          onError={(e) => {
            console.error(`Image load error for item ${item.itemID}`);
            e.target.style.display = 'none';
          }}
        />
      );
    }
    return (
      <div style={{
        width: '420px',
        height: '300px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        display: 'flex',
        maxWidth: '250px', 
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
        <h1>Retrieve item</h1>
        <div className="coheader">
        <input 
          type="text" 
          className="search-bar" 
          placeholder="Search..." 
          value={searchTerm}
          onChange={handleSearch}
        />
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="horizontal-scroll-container1">
        {filteredItems.map((item) => (
          <div className="item-card1" key={item.itemID}>
            {item.imageUrl && (
              <img
                src={item.image}
                alt={item.description}
                className="item-image"
              />
            )}
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Date:</strong> {new Date(item.dateLostOrFound).toLocaleDateString()}</p>
            <p><strong>Registered By:</strong> {item.userEmail}</p>
            <p><strong>Location:</strong> {item.location}</p>
            <p><strong>{renderItemImage(item)}</strong></p>
            <p><strong>Status:</strong> {item.status}</p>
            <p><strong> 
              <button 
                    onClick={() => handleClaimClick(item)}
                    className="edit-btn"
                  >
                    Retrieve
                  </button>
                </strong></p>
          </div>
        ))}
      </div>

      {/* Claim Popup */}
      {showClaimPopup && selectedItem && (
        <div className="modal-overlay1" onClick={handleCloseClaimPopup}>
          <div 
            className="popup1" 
            onClick={(e) => e.stopPropagation()} 
            style={{ 
              height: 'auto',
              width: '400px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
          >
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Please Wait</h2>
            
            <div style={{ 
              backgroundColor: '#f5f5f5',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Description:</strong>
                <div>{selectedItem.description}</div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Date Found:</strong>
                <div>
                  {selectedItem.dateLostOrFound 
                    ? new Date(selectedItem.dateLostOrFound).toLocaleDateString() 
                    : ''}
                </div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Registered By:</strong>
                <div>{selectedItem.userEmail}</div>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Location:</strong>
                <div>{selectedItem.location}</div>
              </div>
            </div>

            <p style={{ 
              textAlign: 'center', 
              fontSize: '16px', 
              color: '#666',
              margin: '10px 0' 
            }}>
              Wait for further instruction
            </p>

            <button 
              onClick={handleCloseClaimPopup}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                alignSelf: 'center',
                marginTop: '10px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemManagement;