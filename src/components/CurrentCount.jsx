import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { Grid, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import RewardIcon from '@mui/icons-material/Stars';
import PointIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';

import './Design.css';
function CurrentCount() {
    const userCount = 100; // Example count
    const rewardCount = 50; // Example count
    const pointCount = 200; // Example count
    const itemCount = 75; // Example count
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
   


 countUsers();
   countItems();
   countPoints();
   countRewards();
  }, []);

  return (
    <>
       <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            backgroundColor: '#c5e1a5',
            borderRadius: 2,
            boxShadow: 3,
            height: 110,
          }}
        >   <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
        <PeopleIcon sx={{ fontSize: 40, marginRight: 1 }} />
        <Typography variant="h3">{count}</Typography>
      </Box>
          <Typography variant="body1" color="textSecondary">
            Users
          </Typography>
        </Box>
      </Grid>

 
      <Grid item xs={12} sm={6} md={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            backgroundColor: '#ffcc80',
            borderRadius: 2,
            boxShadow: 3,
            height: 110,
          }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
          <RewardIcon sx={{ fontSize: 40, marginRight: 2 }} />
          <Typography variant="h3">{countReward}</Typography></Box>
          <Typography variant="body1" color="textSecondary">
            Reward
          </Typography>
        </Box>
      </Grid>

    
      <Grid item xs={12} sm={6} md={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            backgroundColor: '#81d4fa',
            borderRadius: 2,
            boxShadow: 3,
            height: 110,
          }}
        >
             <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
          <PointIcon sx={{ fontSize: 40, marginRight: 2 }} />
          <Typography variant="h3">{countPoint}</Typography></Box>
          <Typography variant="body1" color="textSecondary">
            Point
          </Typography>
        </Box>
      </Grid>


      <Grid item xs={12} sm={6} md={3}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            backgroundColor: '#ffe082',
            borderRadius: 2,
            boxShadow: 3,
            height: 110,
          }}
        >
              <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
          <InventoryIcon sx={{ fontSize: 40, marginRight: 2 }} />
          <Typography variant="h3">{countItem}
          </Typography></Box>
          <Typography variant="body1" color="textSecondary">
            Item
          </Typography>
        </Box>
      </Grid>
    </Grid>

    <br>
    </br>
    <br></br>
   </>
  );
}

export default CurrentCount;
