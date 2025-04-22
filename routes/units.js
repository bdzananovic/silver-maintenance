const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataDir = path.join(__dirname, '..', 'data');

router.get('/trucks', (req, res) => {
  fs.readFile(path.join(dataDir, 'trucks.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading trucks.json:', err);
      return res.status(500).json({ error: 'Failed to read trucks data' });
    }
    try {
      const trucks = JSON.parse(data);
      res.json(trucks);
    } catch (parseErr) {
      console.error('Error parsing trucks.json:', parseErr);
      res.status(500).json({ error: 'Invalid trucks data format' });
    }
  });
});

router.get('/trailers', (req, res) => {
  fs.readFile(path.join(dataDir, 'trailers.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading trailers.json:', err);
      return res.status(500).json({ error: 'Failed to read trailers data' });
    }
    try {
      const trailers = JSON.parse(data);
      res.json(trailers);
    } catch (parseErr) {
      console.error('Error parsing trailers.json:', parseErr);
      res.status(500).json({ error: 'Invalid trailers data format' });
    }
  });
});

module.exports = router;
