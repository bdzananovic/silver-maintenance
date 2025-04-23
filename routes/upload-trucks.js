const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const trucksFilePath = path.join(__dirname, '../data/trucks.json');

router.post('/', async (req, res) => {
  try {
    const { trucks } = req.body;

    // Validate payload
    if (!Array.isArray(trucks)) {
      return res.status(400).json({ error: 'Invalid or missing trucks array' });
    }

    // Optional: Validate individual truck objects
    for (const truck of trucks) {
      if (!truck.id || !truck.name) {
        return res.status(400).json({ error: 'Each truck must have an id and name' });
      }
    }

    // Ensure the data directory exists
    const dataDir = path.dirname(trucksFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write the trucks data to the file asynchronously
    await fs.promises.writeFile(trucksFilePath, JSON.stringify(trucks, null, 2));
    res.json({ message: 'Trucks saved successfully' });

  } catch (error) {
    console.error('Error saving trucks:', error);
    res.status(500).json({ error: 'Failed to save trucks' });
  }
});

module.exports = router;