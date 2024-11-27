const express = require("express");
const router = express.Router();
const { getQrCode } = require("../controllers/displayQRController");

router.get("/:uniqueId", getQrCode);

module.exports = router;
