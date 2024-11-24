import { useState, useEffect } from 'react';
import './Design.css';
import './Item.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

function ItemManagement() {
  const [items, setItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [item, setItem] = useState({
    description: '',
    dateLostOrFound: '',
    registeredBy: '',
    location: '',
    status: 'Found',
    imageUrl: '', // Assuming imageUrl is part of item data
  });
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // To store the logged-in user

  const fetchItems = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/items/getAllItems');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      setError('Error fetching items');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('authToken'); // Retrieve token
      const response = await fetch('http://localhost:8083/api/users/getCurrentUser', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Include token
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch current user');
      const data = await response.json();
      setCurrentUser(data); // Set the current user from the response
    } catch (error) {
      setError('Error fetching user');
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCurrentUser(); // Fetch the logged-in user when the component mounts
  }, []);

  const togglePopup = () => {
    setShowPopup(!showPopup);
    if (!showPopup) {
      setItem({
        description: '',
        dateLostOrFound: '',
        registeredBy: '',
        location: '',
        status: 'Found',
        imageUrl: '', // Reset imageUrl
      });
    }
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

      if (isEditing) {
        setItems((prevItems) =>
          prevItems.map((i) => (i.itemID === updatedItem.itemID ? updatedItem : i))
        );
      } else {
        setItems((prevItems) => [...prevItems, updatedItem]);
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
      dateLostOrFound: itemToEdit.dateLostOrFound
        ? itemToEdit.dateLostOrFound.split('T')[0]
        : '',
    });
    setIsEditing(true);
    setShowPopup(true);
  };

  const handleDelete = async (itemID) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(
          `http://localhost:8083/api/items/deleteItemDetails/${itemID}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete item');
        }

        setItems((prevItems) => prevItems.filter((i) => i.itemID !== itemID));
        setError(null);
      } catch (error) {
        setError(`Error deleting item: ${error.message}`);
      }
    }
  };

  const filteredItems = items.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearchTerm =
      (item.dateLostOrFound && item.dateLostOrFound.toString().includes(searchTermLower)) ||
      (item.description && item.description.toLowerCase().includes(searchTermLower)) ||
      (item.registeredBy && item.registeredBy.toLowerCase().includes(searchTermLower)) ||
      (item.location && item.location.toLowerCase().includes(searchTermLower));
  
    const matchesStatus =
      !statusFilter || item.status.toLowerCase() === statusFilter.toLowerCase();
  
    return matchesSearchTerm && matchesStatus;
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
  
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError('File is too large. Please choose an image under 5MB.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setItem(prev => ({
          ...prev,
          image: reader.result
        }));
        setError(null);
      };
      reader.onerror = () => {
        setError('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="content">
      <div className="content-header">
        <h1>Current Items Pending</h1>
        <div className="coheader">
        <select
    className="status-dropdown"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="">All Status</option>
    <option value="Found">Found</option>
    <option value="Lost">Lost</option>
  </select>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <input
            type="text"
            className="search-bar"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={togglePopup} className="add-button1" title="Add Item">
            <h6>+ Add Item</h6>
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="horizontal-scroll-container">
        {filteredItems.map((item) => (
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
          </div>
        ))}
      </div>

      {showPopup && (
        <div className="modal-overlay1" onClick={togglePopup}>
          <div
            className="popup1"
            onClick={(e) => e.stopPropagation()}
            style={{ height: '700px', width: '500px' }}
          >
            <h2>{isEditing ? 'Edit Item' : 'Create New Item'}</h2>
            <form onSubmit={handleSubmit} className="item-form">
              <div className="form-group">
                <label>Description:</label>
                <input
                  type="text"
                  name="description"
                  value={item.description}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date Lost/Found:</label>
                <input
                  type="date"
                  name="dateLostOrFound"
                  value={item.dateLostOrFound}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Registered By:</label>
                <input
                  type="text"
                  name="registeredBy"
                  value={currentUser ? currentUser.school_email : 'Loading...'}
                  disabled
                  required
                />
              </div>

              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  name="location"
                  value={item.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Status:</label>
                <select
                className="dropdown"
                  name="status"
                  value={item.status}
                  onChange={handleChange}
                >
                  <option value="Found">Found</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              <div className="form-group">
                <label>Image (5MB MAX):</label>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                />
                {item.image && <img src={item.image} alt="Preview" className="image-preview" />}
              </div>

              {error && <div className="error">{error}</div>}

              <button type="submit" className="edit-btn">
                {isEditing ? 'Update Item' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemManagement;