import { useState, useEffect } from 'react';
import './Design.css';
import MyAccordion from './AccordionLatestAdded'
import CurrentCount from './user-CurrentCount'
function Dashboard() {
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
    <div className="content">
      <h1>Dashboard</h1>
        {error && <p className="error">{error}</p>}
        <CurrentCount/>
         <MyAccordion/>
      <br></br>
      <br></br>
   
    </div>

    
  );
}

export default Dashboard;
