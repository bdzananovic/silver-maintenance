const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataFilePath = path.join(__dirname, '..', 'data', 'units.json');

router.post('/', (req, res) => {
  const incoming = req.body;

  if (!Array.isArray(incoming)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  // Load existing data
  let existing = [];
  if (fs.existsSync(dataFilePath)) {
    try {
      const raw = fs.readFileSync(dataFilePath, 'utf-8');
      existing = JSON.parse(raw);
    } catch (err) {
      console.error('Error reading existing units:', err);
    }
  }

  // Determine if upload is trucks or trailers
  const isTruck = incoming[0]?.truckid || incoming[0]?.TruckId;
  const isTrailer = incoming[0]?.trailerid || incoming[0]?.TrailerId;

  if (!isTruck && !isTrailer) {
    return res.status(400).json({ error: 'Could not determine unit type' });
  }

  const cleanedExisting = existing.filter(unit => {
    if (isTruck) return !(unit.truckid || unit.TruckId);
    if (isTrailer) return !(unit.trailerid || unit.TrailerId);
    return true;
  });

  const combined = [...cleanedExisting, ...incoming];

  fs.writeFile(dataFilePath, JSON.stringify(combined, null, 2), err => {
    if (err) {
      console.error('Error saving units:', err);
      return res.status(500).json({ error: 'Failed to save unit data' });
    }

    console.log(`✅ Merged ${incoming.length} ${isTruck ? 'trucks' : 'trailers'} into data/units.json`);
    res.json({ message: 'Units saved successfully', count: incoming.length });
  });
});

module.exports = router;
