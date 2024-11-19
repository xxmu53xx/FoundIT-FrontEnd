import { useState, useEffect } from 'react';
import './Design.css';
import './Item.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

function ItemManagement() {
  const [items, setItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [item, setItem] = useState({
    description: '',
    dateLostOrFound: '',
    registeredBy: '',
    location: '',
    status: 'Found',
  });
  const [error, setError] = useState(null); 

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
        status: 'Found',
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
        setItems(prevItems => 
          prevItems.map((i) => (i.itemID === updatedItem.itemID ? updatedItem : i))
        );
      } else {
        setItems(prevItems => [...prevItems, updatedItem]);
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
      item.location.toLowerCase().includes(searchTermLower) ||
      item.status.toLowerCase().includes(searchTermLower)
    );
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  return (
    <div className="content">
      <div className="content-header">
        
        <h1>Items</h1>
        <div className="coheader">
        <input 
          type="text" 
          className="search-bar" 
          placeholder="Search..." 
          value={searchTerm}
          onChange={handleSearch}
        />
        <button onClick={togglePopup} className="add-button1" title="Add Item">
          <h6>+ Add Item</h6>
        </button></div>
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
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {filteredPoints.map((item) => (
        <tr key={item.itemID}>
       
          <td>{item.description}</td>
          <td>{item.dateLostOrFound ? new Date(item.dateLostOrFound).toLocaleDateString() : ''}</td>
          <td>{item.registeredBy}</td>
          <td>{item.location}</td>
          <td>{item.status}</td>
       
        </tr>
      ))}
    </tbody>
  </table>
</div>

      {showPopup && (
        <div className="modal-overlay1" onClick={togglePopup} >
          <div className="popup1" onClick={(e) => e.stopPropagation()}  style={{ height: '440px', width: '500px' }}>
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
                  type="number"
                  name="registeredBy"
                  value={item.registeredBy}
                  onChange={handleChange}
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
                <label>Status:
                <select name="status" value={item.status} onChange={handleChange} required>
                  <option value="Lost">Lost</option>
                  <option value="Found">Found</option>
                </select></label>
              </div>

              <div className="form-buttons">
                <button type="submit" className="edit-btn">
                  {isEditing ? 'Update Item' : 'Create Item'}
                </button>
                <button type="button" className="delete-btn" onClick={togglePopup}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemManagement;