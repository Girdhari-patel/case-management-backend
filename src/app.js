const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product.routes');
const optionsRoutes = require('./routes/options.routes');
const masterDataRoutes = require('./routes/masterData.routes');
const caseRoutes = require('./routes/case.routes');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/products', productRoutes);
app.use('/api/options', optionsRoutes);
app.use('/api/master-data', masterDataRoutes);
app.use("/api/cases", caseRoutes);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
