const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataDir = path.join(__dirname, '..', 'data');
const trucksFile = path.join(dataDir, 'trucks.json');
const trailersFile = path.join(dataDir, 'trailers.json');

// GET trucks
router.get('/trucks', (req, res) => {
  fs.readFile(trucksFile, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read trucks' });
    try {
      res.json(JSON.parse(data));
    } catch {
      res.status(500).json({ error: 'Failed to parse trucks data' });
    }
  });
});

// GET trailers
router.get('/trailers', (req, res) => {
  fs.readFile(trailersFile, 'utf-8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read trailers' });
    try {
      res.json(JSON.parse(data));
    } catch {
      res.status(500).json({ error: 'Failed to parse trailers data' });
    }
  });
});

module.exports = router;
