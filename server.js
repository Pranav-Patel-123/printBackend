const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const displayfilesRoutes = require('./routes/displayfilesRoutes');
const displayQrRoutes = require('./routes/displayQrRoutes');
// const printRoutes = require("./routes/printRoutes");
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();
const app = express();

// MongoDB connection
const connectDB = async () => {
  try {
    // Directly use the MongoDB connection string here
    const mongoURI = 'mongodb+srv://test:3dGQuUYsGJiehTSl@cluster0.yttrefz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
};

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [
  'https://hilarious-salamander-0fa7c0.netlify.app',
  'https://inspiring-pika-045528.netlify.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      // Allow requests with no origin (like mobile apps) or matching origins
      callback(null, true);
    } else {
      // Reject requests with origins not in the list
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies and headers like Authorization
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/displayfiles", displayfilesRoutes); // Display files by uniqueId
app.use("/api/qrcode", displayQrRoutes);
// app.use("/api", printRoutes);

// Start server
const PORT = process.env.PORT || 5000; // Default to 5000 if PORT is not set
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
