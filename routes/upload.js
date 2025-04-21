const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataFilePath = path.join(__dirname, '..', 'data', 'units.json');

router.post('/', (req, res) => {
  const units = req.body;
  console.log('🛬 Received upload request with', units.length, 'units');

  if (!Array.isArray(units)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }
  console.log('📁 Attempting to write to:', dataFilePath);

  fs.writeFile(dataFilePath, JSON.stringify(units, null, 2), (err) => {
    if (err) {
      console.error('Error saving units:', err);
      return res.status(500).json({ error: 'Failed to save unit data' });
    }

    console.log(`✅ Saved ${units.length} units to data/units.json`);
    res.json({ message: 'Units saved successfully', count: units.length });
  });
});

module.exports = router;
