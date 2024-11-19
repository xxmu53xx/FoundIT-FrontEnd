
const NewEntity = () => {
    const [entities, setEntities] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [newEntity, setNewEntity] = useState({
      name: '',
      description: '',
      status: 'active'
    })
  
    return (
      <div>
        <div className="content-header">
          <h1>New Entity</h1>
          <button onClick={() => setShowForm(true)} className="add-button">
            <h6>+ Add Entity</h6>
          </button>
        </div>
  
        <div className="table-container">
          <table>
            <thead>
              <tr className="labellist">
                <th>NAME</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th className="actions-column">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity) => (
                <tr key={entity.id}>
                  <td>{entity.name}</td>
                  <td>{entity.description}</td>
                  <td>{entity.status}</td>
                  <td className="actions-column">
                    <button className="edit-btn">Edit</button>
                    <button className="delete-btn">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="popup" onClick={(e) => e.stopPropagation()}>
              <h2>Create New Entity</h2>
              <form className="user-form">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={newEntity.name}
                    onChange={(e) => setNewEntity({...newEntity, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <input
                    type="text"
                    name="description"
                    value={newEntity.description}
                    onChange={(e) => setNewEntity({...newEntity, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    name="status"
                    value={newEntity.status}
                    onChange={(e) => setNewEntity({...newEntity, status: e.target.value})}
                    className="form-control"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-buttons">
                  <button type="submit" className="edit-btn">Create Entity</button>
                  <button type="button" className="delete-btn" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }