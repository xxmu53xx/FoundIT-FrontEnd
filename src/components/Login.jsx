import { useState, useEffect } from 'react';
import axios from 'axios'; // Make sure to install axios if you haven't

// Login Component
const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [userList, setUserList] = useState([]); // State to hold fetched users

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/users'); // Replace with your actual endpoint
        setUserList(response.data); // Assuming response.data contains the user array
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const user = userList.find(user => user.email === credentials.email);
    
    if (!user) {
      setError('Email not found');
      return;
    }

    if (user.password !== credentials.password) {
      setError('Invalid password');
      return;
    }

    onLogin(user);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #7c2d2d, #5a1e1e)',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }}>
        <h1 style={{
          color: '#7c2d2d',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>ADMIN</h1>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              color: '#7c2d2d',
              fontSize: '14px',
              marginBottom: '0.5rem'
            }}>Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e5e5',
                borderRadius: '6px',
                backgroundColor: '#f9f9f9',
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              color: '#7c2d2d',
              fontSize: '14px',
              marginBottom: '0.5rem'
            }}>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #e5e5e5',
                borderRadius: '6px',
                backgroundColor: '#f9f9f9',
              }}
              required
            />
          </div>
          {error && <div style={{ color: '#dc2626', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}
          <button 
            type="submit"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#fbbf24',
              border: 'none',
              borderRadius: '6px',
              color: 'black',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
