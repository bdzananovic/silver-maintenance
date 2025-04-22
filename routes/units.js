const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const trucksPath = path.join(__dirname, '..', 'data', 'trucks.json');
const trailersPath = path.join(__dirname, '..', 'data', 'trailers.json');

router.get('/', (req, res) => {
  try {
    const trucks = fs.existsSync(trucksPath)
      ? JSON.parse(fs.readFileSync(trucksPath, 'utf-8'))
      : [];
    const trailers = fs.existsSync(trailersPath)
      ? JSON.parse(fs.readFileSync(trailersPath, 'utf-8'))
      : [];

    res.json({ trucks, trailers });
  } catch (err) {
    console.error('❌ Error reading unit files:', err);
    res.status(500).json({ error: 'Failed to read unit data' });
  }
});

module.exports = router;
