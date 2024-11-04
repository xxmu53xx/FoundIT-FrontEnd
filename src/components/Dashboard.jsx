import { useState, useEffect } from 'react';
import './Design.css';

function Dashboard() {
  const [latestUsers, setLatestUsers] = useState([]);
  const [latestItems, setLatestItems] = useState([]);
  const [latestRewards, setLatestRewards] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestUsers = async () => {
      try {
        const response = await fetch('http://localhost:8083/api/users/getLatestUsers?count=5');
        if (!response.ok) throw new Error('Failed to fetch latest users');
        const data = await response.json();
        setLatestUsers(data);
      } catch (error) {
        setError('Error fetching latest users');
      }
    };
 
    const countUsers = async () => {
      try {
          const response = await fetch('http://localhost:8083/api/users/getCountUsers');
          if (!response.ok) {
              throw new Error("Network response was not ok");
          }
          const data = await response.json(); // Parse JSON from response
          setCount(data.user_count); // Update the count state with the parsed data
      } catch (error) {
          console.error("Error fetching user count:", error);
      }
  };
   
    const fetchLatestItems = async () => {
      try {
        const response = await fetch('http://localhost:8083/api/items/getLatestItems'); // Ensure this endpoint exists
        if (!response.ok) throw new Error('Failed to fetch latest items');
        const data = await response.json();
        setLatestItems(data);
      } catch (error) {
        setError('Error fetching latest items');
      }
    };

    const fetchLastestRewards = async () => {
      try {
        const response = await fetch('http://localhost:8083/api/rewards/getLatestRewards'); // Ensure this endpoint exists
        if (!response.ok) throw new Error('Failed to fetch latest Rewards');
        const data = await response.json();
        setLatestRewards(data);
      } catch (error) {
        setError('Error fetching latest Rewards');
      }
    }; countUsers();
    fetchLatestUsers();
    fetchLatestItems();
    fetchLastestRewards();
   
  }, []);

  return (
    <div className="content">
      <h1>Dashboard</h1>
        {error && <p className="error">{error}</p>}

      <div className="content-header"></div>
      <div className="latest-section">
    <div className="content-header"> 
       
        <h3 className="latest-title">Latest Added Users</h3> <h4 className="user-count">Current Users: {count}</h4>
    </div>
    <div className="table-container">
        <table>
            <thead>
                <tr>
                    <th>School ID</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {latestUsers.slice(0, 3).map((user) => (
                    <tr key={user.userID}>
                        <td>{user.schoolId}</td>
                        <td>{user.schoolEmail}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>
  
        <div className="latest-section">
          <h3>Latest Added Items</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  
                  <th>Description</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th></th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {latestItems.slice(0, 3).map((item) => ( // Adjust this as per your item's structure
                  <tr key={item.itemID}>
                  
                    <td>{item.description}</td>
                    <td>{item.location}</td>
                    <td>{item.status}</td>
                    <td>➜</td>
                    <td>{item.dateLostOrFound}</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
        <div className="latest-section">
          <h3>Latest Added Rewards</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
              
                  <th>Reward Name</th>
                  <th>Points Required</th>
                  
                </tr>
              </thead>
              <tbody>
              {latestRewards.slice(0, 3).map((reward) => ( // Adjust this as per your item's structure
                  <tr key={reward.rewardId}>
                  
                    <td>{reward.rewardName}</td>
                    <td>{reward.pointsRequired}</td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
    </div>

    
  );
}

export default Dashboard;
