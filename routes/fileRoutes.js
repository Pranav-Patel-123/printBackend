const express = require("express");
const router = express.Router();
const { upload, uploadFiles } = require("../controllers/fileController");

// Define the route for file uploads
router.post("/upload", upload.array("files[]"), uploadFiles);

module.exports = router;
