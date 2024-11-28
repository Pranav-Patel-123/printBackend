require("dotenv").config();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'delwraixa',
  api_key: '354242333558914',
  api_secret: 'bXRyzeB89ex3ayPQY0gAel_pcC8',
}); 

// User signup
const signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new user (the pre('save') middleware will hash the password)
    const newUser = new User({ username, password });
    await newUser.save();

    // Generate the unique URL
    const uniqueUrl = `https://inspiring-pika-045528.netlify.app/#/form?uniqueId=${newUser.uniqueId}`;

    // Generate the QR code in buffer format
    const qrBuffer = await QRCode.toBuffer(uniqueUrl);

    // Upload the QR code to Cloudinary
    const folderPath = `${newUser.uniqueId}`; // Define folder path in Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folderPath, // Upload to the specific folder
          resource_type: 'image',
          public_id: 'Qrcode', // Name the file "Qrcode"
          overwrite: true, // Ensure the file is overwritten if it already exists
          format: 'png', // Save the QR code as a .jpg file
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading QR code to Cloudinary:', error);
            reject(new Error('Failed to upload QR code.'));
          } else {
            resolve(result);
          }
        }
      );

      // Pipe the QR buffer into the upload stream
      const readableStream = require('stream').Readable.from(qrBuffer);
      readableStream.pipe(uploadStream);
    });

    // Respond with the details
    res.status(201).json({
      message: 'User registered successfully',
      uniqueId: newUser.uniqueId,
      qrCodeUrl: uploadResult.secure_url, // Return the Cloudinary URL for the QR code
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};




// User login
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user);

    // Log the plain password and the stored password
    console.log('Plain password from request:', password);
    console.log('Stored hashed password:', user.password);

    // Compare the passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match status:', isMatch);

    if (!isMatch) {
      console.error('Invalid credentials: Password does not match');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      token,
      uniqueId: user.uniqueId,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};




module.exports = { signup, login };
