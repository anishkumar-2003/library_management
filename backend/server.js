const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboard.html'));
});

app.get('/maintenance', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/maintenance.html'));
});

app.get('/transactions', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/transactions.html'));
});

app.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/reports.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../frontend/login.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Library Management System is running at http://localhost:${PORT}`);
  console.log(`Open your browser and navigate to http://localhost:${PORT} to start using the application.`);
  console.log(`\nDemo Credentials:`);
  console.log(`Admin - Username: admin, Password: admin123`);
  console.log(`User - Username: user1, Password: user123`);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Library Management System running on http://localhost:${PORT}`);
});
