// TOP of file
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/stocks', require('./routes/stocks'));

// Start
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = app;
