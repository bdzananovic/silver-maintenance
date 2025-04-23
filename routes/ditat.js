const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

const DITAT_BASE_URL = process.env.DITAT_BASE_URL;
const ACCOUNT_ID = process.env.DITAT_ACCOUNT_ID;
const USERNAME = process.env.DITAT_USERNAME;
const PASSWORD = process.env.DITAT_PASSWORD;

// Validate environment variables
if (!DITAT_BASE_URL || !ACCOUNT_ID || !USERNAME || !PASSWORD) {
  console.error("❌ Missing required environment variables for Ditat API integration.");
  process.exit(1); // Exit the application if critical env vars are missing
}

// Get Ditat auth token
async function getAuthToken() {
  const url = `${DITAT_BASE_URL}/api/tms/auth/login`;
  console.log("🔐 Logging in to:", url);

  const credentials = Buffer.from(`${USERNAME}:${PASSWORD}`).toString('base64');
  const headers = {
    'Ditat-Application-Role': 'Login to TMS',
    'Ditat-Account-Id': ACCOUNT_ID,
    'Authorization': `Basic ${credentials}`
  };

  try {
    const response = await axios.post(url, null, { headers, timeout: 5000 }); // Add timeout
    console.log("✅ Login success");
    return response.data;
  } catch (err) {
    console.error("❌ Failed to authenticate with Ditat API:", err.response?.data || err.message);
    throw new Error('Authentication failed');
  }
}

// Get active truck and trailer counts
router.get('/units/active-counts', async (req, res) => {
  try {
    const token = await getAuthToken();

    // Fetch active trucks and trailers concurrently
    const [trucksResponse, trailersResponse] = await Promise.all([
      axios.get(`${DITAT_BASE_URL}/api/tms/data/truck/export`, {
        headers: { Authorization: `Ditat-Token ${token}` },
        timeout: 5000 // Add timeout
      }),
      axios.get(`${DITAT_BASE_URL}/api/tms/data/trailer/export`, {
        headers: { Authorization: `Ditat-Token ${token}` },
        timeout: 5000 // Add timeout
      })
    ]);

    const trucks = trucksResponse.data || [];
    const trailers = trailersResponse.data || [];

    const activeTrucks = trucks.filter(t => t.IsActive).length;
    const activeTrailers = trailers.filter(t => t.IsActive).length;

    res.json({
      trucks: activeTrucks,
      trailers: activeTrailers
    });
  } catch (err) {
    console.error('❌ Error fetching unit counts:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch unit counts' });
  }
});

module.exports = router;