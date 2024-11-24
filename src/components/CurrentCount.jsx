import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { Grid, Box } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import RewardIcon from '@mui/icons-material/Stars';
import PointIcon from '@mui/icons-material/PointOfSale';
import InventoryIcon from '@mui/icons-material/Inventory';
import { Link } from 'react-router-dom';
import './Design.css';
function CurrentCount() {
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
          setCountPoint(data.point_count); 
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
          const data = await response.json(); 
          setCount(data.user_count); 
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
      <Link to="/admin/user-management" style={{ textDecoration: 'none' }}> 
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            backgroundColor: '#b5201f',
            color:'White',
            borderRadius: 2,
            boxShadow: 3,
            height: 110,
            cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
              },
          }}
        >   <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
        <PeopleIcon sx={{ fontSize: 40, marginRight: 1 }} />
        <Typography variant="h3">{count}</Typography>
      </Box>
          <Typography variant="body1" color="white">
            Users
          </Typography>
        </Box>
        </Link>
      </Grid>

 
      <Grid item xs={12} sm={6} md={3}>
      <Link to="/admin/rewards" style={{ textDecoration: 'none' }}> 
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            backgroundColor: '#e4d07b',
            borderRadius: 2,
            boxShadow: 3,
            height: 110,
            cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
              },
          }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
          <RewardIcon sx={{ fontSize: 40, marginRight: 2 }} />
          <Typography variant="h3">{countReward}</Typography></Box>
          <Typography variant="body1" color="textSecondary">
            Reward
          </Typography>
        </Box>
        </Link>
      </Grid>

    
      <Grid item xs={12} sm={6} md={3}>
      <Link to="/admin/points" style={{ textDecoration: 'none' }}> 
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            backgroundColor: '#b5201f',
            color:'white',
            borderRadius: 2,
            boxShadow: 3,
            height: 110,
            cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
              },
          }}
        >
             <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
          <PointIcon sx={{ fontSize: 40, marginRight: 2 }} />
          <Typography variant="h3">{countPoint}</Typography></Box>
          <Typography variant="body1" color="white">
            Point
          </Typography>
        </Box>
        </Link>
      </Grid>


      <Grid item xs={12} sm={6} md={3}>
      <Link to="/admin/item" style={{ textDecoration: 'none' }}> 
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2,
            backgroundColor: '#e4d07b',
            borderRadius: 2,
            boxShadow: 3,
            height: 110,
            cursor: 'pointer',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6,
              },
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
        </Link>
      </Grid>
    </Grid>

    <br>
    </br>
    <br></br>
   </>
  );
}

export default CurrentCount;
