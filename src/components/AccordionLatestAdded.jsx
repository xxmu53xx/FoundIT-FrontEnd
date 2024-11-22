import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './Design.css';
function MyAccordion() {
    const [latestUsers, setLatestUsers] = useState([]);
  const [latestItems, setLatestItems] = useState([]);
  const [latestRewards, setLatestRewards] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);
  const[countPoint,setCountPoint]=useState(0);
  const[countReward,setCountReward]=useState(0);
  const[countItem,setCountItem]=useState(0);

  useEffect(() => {
    const countPoints = async () => {
      try {
          const response = await fetch('http://localhost:8083/api/points/getCountPoints');
          if (!response.ok) {
              throw new Error("Error reponse");
          }
          const data = await response.json();
          setCountPoint(data.user_count); 
      } catch (error) {
          console.error("Error fetching user count:", error);
      }
  };
    const countRewards = async () => {
      try {
          const response = await fetch('http://localhost:8083/api/rewards/getCountRewards');
          if (!response.ok) {
              throw new Error("Error reponse");
          }
          const data = await response.json();
          setCountReward(data.user_count); 
      } catch (error) {
          console.error("Error fetching user count:", error);
      }
  };
    const countItems = async () => {
      try {
          const response = await fetch('http://localhost:8083/api/items/getCountItem');
          if (!response.ok) {
              throw new Error("Error reponse");
          }
          const data = await response.json();
          setCountItem(data.user_count); 
      } catch (error) {
          console.error("Error fetching user count:", error);
      }
  };
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
          const data = await response.json(); 
          setCount(data.user_count);
      } catch (error) {
          console.error("Error fetching user count:", error);
      }
  };
   
    const fetchLatestItems = async () => {
      try {
        const response = await fetch('http://localhost:8083/api/items/getLatestItems'); 
        if (!response.ok) throw new Error('Failed to fetch latest items');
        const data = await response.json();
        setLatestItems(data);
      } catch (error) {
        setError('Error fetching latest items');
      }
    };

    const fetchLastestRewards = async () => {
      try {
        const response = await fetch('http://localhost:8083/api/rewards/getLatestRewards'); 
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
   countItems();
   countPoints();
   countRewards();
  }, []);

  return (
    <>
    {/*this is how to change accordion main color*/}
    <Accordion defaultExpanded className="accordion-root" sx={{ backgroundColor: '#9c6b54',border: '2px solid none', borderRadius: '25px',padding: '5px' }}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1-content"
        id="panel1-header"
         className="accordion-summary"
      >
        <Typography sx={{color:'White',fontSize: '1.5rem' }}>Top 3 Recently Added</Typography>
      </AccordionSummary>
      <AccordionDetails >
        <Typography className="accordion-details" sx={{color:'Black',border: '2px solid none', borderRadius: '25px',padding: '20px' }}>
        <div className="content-header"></div>
      <div className="latest-section">
    <div className="content-header"> 
       
        <h3 className="latest-title">Recently Added Users</h3> <h4 className="user-count">Current Users: {count}</h4>
    </div>
    <div className="table-container" >
        <table >
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
<br></br>
<br></br>
        <div className="latest-section">
        <div className="content-header"> 
          <h3>Recently Added Items</h3><h4 className="user-count">Current Items: {countItem}</h4></div>
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
                {latestItems.slice(0, 3).map((item) => ( 
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
        <br></br>
        <br></br>
        <div className="latest-section">
        <div className="content-header"> 
          <h3>Recently Added Rewards</h3><h4 className="user-count">Current Rewards: {countReward}</h4>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
              
                  <th>Reward Name</th>
                  <th>Points Required</th>
                  
                </tr>
              </thead>
              <tbody>
              {latestRewards.slice(0, 3).map((reward) => ( 
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
        </Typography>
      </AccordionDetails>
    </Accordion></>
  );
}

export default MyAccordion;
