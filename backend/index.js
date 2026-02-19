const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./database/connection');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const loginRoutes = require('./modules/login');
const registerRoutes = require('./modules/register');
const adminRoutes = require('./modules/admin');
const viewerRoutes = require('./modules/viewer');

// Use Routes
app.use('/auth/login', loginRoutes);
app.use('/auth/register', registerRoutes);
app.use('/admin', adminRoutes);
app.use('/viewer', viewerRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
