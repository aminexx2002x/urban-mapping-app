require('dotenv').config();
const express = require('express');
const cors = require('cors');
const regionsRouter = require('./api/regions');

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Mount all routes under /api
app.use('/api', regionsRouter);

// Test route to verify server is running
app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Add route logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const PORT = process.env.PORT || 5001;

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available routes:');
    console.log('  GET /api/regions');
    console.log('  GET /api/wilayas');
    console.log('  GET /api/dairas');
    console.log('  GET /api/communes');
    console.log('  GET /api/administrative-regions');
    console.log('\nDatabase connection details:');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
  });
}

module.exports = app; 