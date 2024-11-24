import { useState, useEffect } from 'react';
import './Design.css';
import './Item.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

function ItemManagement() {
  const [items, setItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showClaimPopup, setShowClaimPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [item, setItem] = useState({
    description: '',
    dateLostOrFound: '',
    registeredBy: '',
    location: '',
    status: 'Lost',
  });
  const [error, setError] = useState(null); 

  
  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/items/getAllItems');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data.filter(item => item.status === 'Found'));
    } catch (error) {
      setError('Error fetching items');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const togglePopup = () => {
    setShowPopup(!showPopup);
    if (!showPopup) {
      setIsEditing(false);
      setItem({
        description: '',
        dateLostOrFound: '',
        registeredBy: '',
        location: '',
        status: 'Lost',
      });
    }
  };

  const handleClaimClick = (itemData) => {
    setSelectedItem(itemData);
    setShowClaimPopup(true);
  };

  const handleCloseClaimPopup = () => {
    setShowClaimPopup(false);
    setSelectedItem(null);
  };
  const filteredPoints = items.filter(item => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      item.dateLostOrFound.toString().includes(searchTermLower) ||
      item.description.toLowerCase().includes(searchTermLower) ||
      item.registeredBy.toString().includes(searchTermLower) ||
      item.location.toLowerCase().includes(searchTermLower)
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


      <div className="horizontal-scroll-container">
        {filteredPoints.map((item) => (
          <div className="item-card" key={item.itemID}>
            {item.imageUrl && (
              <img
                src={item.image}
                alt={item.description}
                className="item-image"
              />
            )}
            <p><strong>Description:</strong> {item.description}</p>
            <p><strong>Date:</strong> {item.dateLostOrFound}</p>
            <p><strong>Registered By:</strong> {item.registeredBy}</p>
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
                <div>{selectedItem.registeredBy}</div>
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