const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple API endpoint
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from Jenkins CI/CD Node.js app!' });
});

// Health endpoint (useful in CI/CD)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Fallback to index.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
