const express = require('express');
const fs = require('fs');
const router = express.Router();

router.post('/', (req, res) => {
  const trailers = req.body.trailers;
  if (!Array.isArray(trailers)) {
    return res.status(400).json({ error: 'Invalid or missing trailers array' });
  }

  fs.writeFile('data/trailers.json', JSON.stringify(trailers, null, 2), err => {
    if (err) return res.status(500).json({ error: 'Failed to save trailers' });
    res.json({ message: 'Trailers saved successfully' });
  });
});

module.exports = router;
