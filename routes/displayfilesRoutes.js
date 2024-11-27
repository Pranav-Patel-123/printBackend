const express = require("express");
const router = express.Router();
const { getFilesByUniqueId } = require("../controllers/displayFilesController");

// Define the route
router.get("/:uniqueId/files", getFilesByUniqueId);

module.exports = router;
