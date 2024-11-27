const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: 'delwraixa',
  api_key: '354242333558914',
  api_secret: 'bXRyzeB89ex3ayPQY0gAel_pcC8',
});
// Controller to fetch QR code for a uniqueId
const getQrCode = async (req, res) => {
  const { uniqueId } = req.params;

  if (!uniqueId) {
    console.error("UniqueId not provided.");
    return res.status(400).json({ message: "UniqueId is required." });
  }

  try {
    // Log the folder being queried
    const folderPath = `${uniqueId}`;
    console.log("Fetching QR code from Cloudinary folder:", folderPath);

    // Fetch all resources under the folder
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: folderPath, // Fetch only files within the uniqueId folder
      max_results: 100,   // Set a limit for files fetched to avoid unnecessary overhead
    });

    // Find the specific QR code file
    const qrCodeFile = result.resources.find(
      (resource) => resource.public_id === `${uniqueId}/Qrcode`
    );

    if (!qrCodeFile) {
      console.error("QR code not found in folder:", uniqueId);
      return res.status(404).json({ message: "QR code not found." });
    }

    const qrCodeUrl = qrCodeFile.secure_url; // Secure URL for the QR code image
    console.log("QR code URL:", qrCodeUrl);

    return res.status(200).json({ url: qrCodeUrl });
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return res.status(500).json({ message: "Failed to fetch QR code." });
  }
};

module.exports = {
  getQrCode,
};
