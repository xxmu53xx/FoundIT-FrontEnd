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
      setItems(data.filter(item => item.status === 'Lost'));
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prevItem) => ({
      ...prevItem,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isEditing) {
        response = await fetch(`http://localhost:8083/api/items/putItemDetails/${item.itemID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      } else {
        response = await fetch('http://localhost:8083/api/items/postItem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} item`);
      }

      const updatedItem = await response.json();

      if (updatedItem.status === 'Lost') {
        if (isEditing) {
          setItems(prevItems => 
            prevItems.map((i) => (i.itemID === updatedItem.itemID ? updatedItem : i))
          );
        } else {
          setItems(prevItems => [...prevItems, updatedItem]);
        }
      }
      
      togglePopup();
      setError(null);
      
      fetchItems();
    } catch (error) {
      setError(`Error ${isEditing ? 'updating' : 'creating'} item: ${error.message}`);
    }
  };

  const handleEdit = (itemToEdit) => {
    setItem({
      ...itemToEdit,
      dateLostOrFound: itemToEdit.dateLostOrFound ? itemToEdit.dateLostOrFound.split('T')[0] : ''
    });
    setIsEditing(true);
    setShowPopup(true);
  };

  const handleDelete = async (itemID) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`http://localhost:8083/api/items/deleteItemDetails/${itemID}`, {
          method: 'DELETE',
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete item');
        }
  
        setItems(prevItems => prevItems.filter((i) => i.itemID !== itemID));
        setError(null);
      } catch (error) {
        setError(`Error deleting item: ${error.message}`);
      }
    }
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

      <div className="table-container">
        <table>
          <thead>
            <tr className="labellist">
              <th>Description</th>
              <th>Date Lost/Found</th>
              <th>Registered By</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPoints.map((item) => (
              <tr key={item.itemID}>
                <td>{item.description}</td>
                <td>{item.dateLostOrFound ? new Date(item.dateLostOrFound).toLocaleDateString() : ''}</td>
                <td>{item.registeredBy}</td>
                <td>{item.location}</td>
                <td>
                  <button 
                    onClick={() => handleClaimClick(item)}
                    className="claim-button"
                    style={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Retrieve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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