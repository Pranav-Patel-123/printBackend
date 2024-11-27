require("dotenv").config(); // Load environment variables
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const File = require("../models/File"); // Import the File model

// Cloudinary is automatically configured using CLOUDINARY_URL
cloudinary.config(); // This will use CLOUDINARY_URL from the environment variables

// Multer configuration with Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const { uniqueId, username } = req.body;

    if (!uniqueId || !username) {
      throw new Error("UniqueId and username are required to define the upload path.");
    }

    return {
      folder: `${uniqueId}/${username}`, // Folder structure in Cloudinary
      public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`, // Unique filename
      resource_type: "auto", // Automatically detect file type
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    cb(null, true); // Accept all file types (customize as needed)
  },
});

// Controller to handle file uploads
const uploadFiles = async (req, res) => {
  const { uniqueId, username, metadata } = req.body;

  if (!uniqueId || !username) {
    return res.status(400).json({ message: "UniqueId and username are required." });
  }

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files were uploaded." });
    }

    const parsedMetadata = JSON.parse(metadata); // Parse metadata from the request

    // Save each file's details to the database
    const savedFiles = [];
    for (const [index, file] of req.files.entries()) {
      // Ensure the file has the necessary details
      if (!file.filename || !file.path) {
        return res.status(400).json({ message: "Uploaded file is missing necessary details." });
      }

      const fileDetails = {
        fileName: file.originalname, // Ensure the fileName field is passed
        publicId: file.filename,    // Cloudinary's public ID
        url: file.path,             // Cloudinary's URL
        layout: parsedMetadata[index].layout,
        pages: parsedMetadata[index].pages,
        color: parsedMetadata[index].color,
        copies: parsedMetadata[index].copies,
      };

      const newFile = new File(fileDetails); // Save to the database
      const savedFile = await newFile.save();
      savedFiles.push(savedFile);
    }

    return res.status(200).json({
      message: "Files uploaded and saved successfully.",
      files: savedFiles,
      user: username,
      uniqueId,
    });
  } catch (error) {
    console.error("Error uploading files:", error.message);
    return res.status(500).json({ message: "Failed to upload files.", error: error.message });
  }
};


module.exports = {
  upload,
  uploadFiles,
};
