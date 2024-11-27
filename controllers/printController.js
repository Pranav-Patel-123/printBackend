const printer = require("printer");
const File = require("../models/fileModel");

const printFile = async (req, res) => {
  const { fileId } = req.body;

  if (!fileId) {
    return res.status(400).json({ success: false, message: "File ID is required." });
  }

  try {
    // Fetch the file details from the database
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ success: false, message: "File not found." });
    }

    // Scan for connected printers
    const printers = printer.getPrinters();
    if (printers.length === 0) {
      return res
        .status(500)
        .json({ success: false, message: "No printers found." });
    }

    // Select the default printer or prompt user to choose
    const defaultPrinter = printers[0].name; // Use the first printer for simplicity

    // Fetch the file from Cloudinary using its URL
    const axios = require("axios");
    const response = await axios({
      url: file.url,
      method: "GET",
      responseType: "stream",
    });

    // Send the file to the printer
    printer.printDirect({
      data: response.data,
      type: "PDF", // Change this if the file is not PDF
      printer: defaultPrinter,
      options: {
        copies: file.copies || 1,
      },
      success: (jobId) => {
        console.log(`Print job submitted. Job ID: ${jobId}`);
        res.status(200).json({
          success: true,
          message: `Print job submitted for ${file.fileName}`,
        });
      },
      error: (err) => {
        console.error("Error printing file:", err);
        res.status(500).json({
          success: false,
          message: "Failed to submit print job.",
          error: err.message,
        });
      },
    });
  } catch (error) {
    console.error("Error during printing:", error);
    res.status(500).json({ success: false, message: "Error during printing." });
  }
};

module.exports = { printFile };
