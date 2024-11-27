const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const displayfilesRoutes = require('./routes/displayfilesRoutes');
const displayQrRoutes = require('./routes/displayQrRoutes');
// const printRoutes = require("./routes/printRoutes");
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/displayfiles", displayfilesRoutes); // Display files by uniqueId
app.use("/api/qrcode", displayQrRoutes);
// app.use("/api", printRoutes);


// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
