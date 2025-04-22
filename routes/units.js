const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data');

// Combine trucks and trailers and serve them
router.get('/', (req, res) => {
  try {
    const trucks = JSON.parse(fs.readFileSync(path.join(dataPath, 'trucks.json'), 'utf8'));
    const trailers = JSON.parse(fs.readFileSync(path.join(dataPath, 'trailers.json'), 'utf8'));
    res.json({ trucks, trailers });
  } catch (err) {
    console.error('❌ Failed to read or parse truck/trailer data:', err);
    res.status(500).json({ error: 'Server error reading unit data' });
  }
});

module.exports = router;
