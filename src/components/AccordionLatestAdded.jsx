import React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function MyAccordion() {
    const [latestUsers, setLatestUsers] = useState([]);
    const [latestItems, setLatestItems] = useState([]);
    const [latestRewards, setLatestRewards] = useState([]);
    const [leaderboardUsers, setLeaderboardUsers] = useState([]);
    const [count, setCount] = useState(0);
    const [error, setError] = useState(null);
    const [countPoint, setCountPoint] = useState(0);
    const [countReward, setCountReward] = useState(0);
    const [countItem, setCountItem] = useState(0);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('http://localhost:8083/api/users/getLeaderboard');
                if (!response.ok) throw new Error('Failed to fetch leaderboard');
                const data = await response.json();
                setLeaderboardUsers(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        };

        const countPoint = async () => {
            try {
                const response = await fetch('http://localhost:8083/api/points/getCountPoints');
                if (!response.ok) {
                    throw new Error("Error response");
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
                    throw new Error("Error response");
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
                    throw new Error("Error response");
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
        };

        // Call all fetch functions
        countUsers();
        fetchLatestUsers();
        fetchLatestItems();
        fetchLastestRewards();
        countItems();
        countPoint();
        countRewards();
        fetchLeaderboard();
    }, []);

    const getRankEmoji = (rank) => {
        switch (rank) {
            case 1:
                return '🥇';
            case 2:
                return '🥈';
            case 3:
                return '🥉';
            default:
                return `#${rank}`;
        }
    };

    return (
        <>
            <Accordion defaultExpanded className="accordion-root" sx={{
                backgroundColor: '#800000',
                border: '3px solid black',
                borderRadius: '10px',
                padding: '5px'
            }}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    className="accordion-summary"
                >
                    <Typography sx={{ color: 'White', fontSize: '1.5rem' }}>Top 3 Recently Added</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography className="accordion-details" sx={{
                        color: 'Black',
                        border: '2px solid black',
                        borderRadius: '10px',
                        padding: '20px',
                        backgroundColor: 'white'
                    }}>
                        <div className="content-header"></div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                            {/* Recently Added Users Section */}
                            <div className="latest-section" style={{ flex: 1 }}>
                                <div className="content-header">
                                    <h3 className="latest-title" style={{ color: '#800000', marginBottom: '10px' }}>
                                        Recently Added Users
                                    </h3>
                                    <h4 className="user-count">Current Users: {count}</h4>
                                </div>
                                <div className="table-container" style={{ border: '1px solid #ddd', borderRadius: '5px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#800000', color: 'white' }}>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>School ID</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {latestUsers.slice(0, 3).map((user) => (
                                                <tr key={user.userID} style={{ borderBottom: '1px solid #ddd' }}>
                                                    <td style={{ padding: '10px' }}>{user.schoolId}</td>
                                                    <td style={{ padding: '10px' }}>{user.schoolEmail}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Leaderboards Section */}
                            <div className="latest-section" style={{ flex: 1 }}>
                                <div className="content-header">
                                    <h3 className="latest-title" style={{ color: '#800000', marginBottom: '10px' }}>
                                        Leaderboards
                                    </h3>
                                    <h4 className="user-count">Top 5 Points</h4>
                                </div>
                                <div className="table-container" style={{ border: '1px solid #ddd', borderRadius: '5px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#800000', color: 'white' }}>
                                                <th style={{ padding: '10px', textAlign: 'center' }}>Rank</th>
                                                <th style={{ padding: '10px', textAlign: 'left' }}>School ID</th>
                                                <th style={{ padding: '10px', textAlign: 'center' }}>Points</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboardUsers.slice(0, 5).map((user, index) => (
                                                <tr key={user.userID} style={{
                                                    borderBottom: '1px solid #ddd',
                                                    backgroundColor: index < 3 ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
                                                }}>
                                                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>
                                                        {getRankEmoji(index + 1)}
                                                    </td>
                                                    <td style={{ padding: '10px' }}>{user.schoolId}</td>
                                                    <td style={{
                                                        padding: '10px',
                                                        textAlign: 'center',
                                                        fontWeight: 'bold',
                                                        color: '#f0f7f6'
                                                    }}>
                                                        {user.currentPoints}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <br />
                        <br />

                        {/* Recently Added Items Section */}
                        <div className="latest-section">
                            <div className="content-header">
                                <h3 style={{ color: '#800000', marginBottom: '10px' }}>Recently Added Items</h3>
                                <h4 className="user-count">Current Items: {countItem}</h4>
                            </div>
                            <div className="table-container" style={{ border: '1px solid #ddd', borderRadius: '5px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#800000', color: 'white' }}>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Location</th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                                            <th style={{ padding: '10px', textAlign: 'center' }}></th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latestItems.slice(0, 3).map((item) => (
                                            <tr key={item.itemID} style={{ borderBottom: '1px solid #ddd' }}>
                                                <td style={{ padding: '10px' }}>{item.description}</td>
                                                <td style={{ padding: '10px' }}>{item.location}</td>
                                                <td style={{ padding: '10px' }}>{item.status}</td>
                                                <td style={{ padding: '10px', textAlign: 'center' }}>➜</td>
                                                <td style={{ padding: '10px' }}>{item.dateLostOrFound}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <br />
                        <br />

                        {/* Recently Added Rewards Section */}
                        <div className="latest-section">
                            <div className="content-header">
                                <h3 style={{ color: '#800000', marginBottom: '10px' }}>Recently Added Rewards</h3>
                                <h4 className="user-count">Current Rewards: {countReward}</h4>
                            </div>
                            <div className="table-container" style={{ border: '1px solid #ddd', borderRadius: '5px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#800000', color: 'white' }}>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Reward Name</th>
                                            <th style={{ padding: '10px', textAlign: 'left' }}>Points Required</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latestRewards.slice(0, 3).map((reward) => (
                                            <tr key={reward.rewardId} style={{ borderBottom: '1px solid #ddd' }}>
                                                <td style={{ padding: '10px' }}>{reward.rewardName}</td>
                                                <td style={{ padding: '10px' }}>{reward.pointsRequired}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </>
    );
}

export default MyAccordion;