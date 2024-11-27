const express = require("express");
const router = express.Router();
const { printFile } = require("../controllers/printController");

router.post("/printfile", printFile);

module.exports = router;
