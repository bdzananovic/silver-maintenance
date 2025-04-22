const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataFilePath = path.join(__dirname, '..', 'data', 'units.json');

router.get('/', (req, res) => {
  fs.readFile(dataFilePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading units file:', err);
      return res.status(500).json({ error: 'Failed to read unit data' });
    }

    try {
      const parsed = JSON.parse(data);
      const trucks = Array.isArray(parsed.trucks) ? parsed.trucks : [];
      const trailers = Array.isArray(parsed.trailers) ? parsed.trailers : [];
      res.json({ trucks, trailers });
    } catch (parseErr) {
      console.error('Error parsing unit JSON:', parseErr);
      res.status(500).json({ error: 'Failed to parse unit data' });
    }
  });
});

module.exports = router;
