require("dotenv").config(); // Ensure Cloudinary URL is loaded from environment variables
const cloudinary = require("cloudinary").v2;

// Controller to fetch files for a uniqueId from Cloudinary
const getFilesByUniqueId = async (req, res) => {
  const { uniqueId } = req.params;

  // Validate uniqueId
  if (!uniqueId) {
    console.error("UniqueId is missing in the request.");
    return res.status(400).json({ message: "UniqueId is required." });
  }

  console.log(`Received uniqueId: ${uniqueId}`);

  try {
    // Define folder path in Cloudinary
    const folderPath = `${uniqueId}/`;

    // Function to fetch files recursively with pagination support
    const fetchFiles = async (cursor = null) => {
      const options = {
        prefix: folderPath,
        max_results: 500, // Adjust the number of results as needed
        next_cursor: cursor, // Include next_cursor if present
        type: "upload", // Add the type parameter here
      };

      try {
        // Fetch resources from Cloudinary using the API
        const result = await cloudinary.api.resources(options);

        // If no files are found
        if (!result.resources || result.resources.length === 0) {
          console.warn(
            "No files found in Cloudinary for the provided uniqueId."
          );
          return { files: [] };
        }

        // Filter out files directly inside the uniqueId folder
        const filteredResources = result.resources.filter((file) => {
          const pathParts = file.public_id.split("/");
          return pathParts.length > 2; // Ensure the file is in a subfolder (username folder)
        });

        // Group files by username
        const groupedFiles = filteredResources.reduce((acc, file) => {
          const pathParts = file.public_id.split("/");
          const username = pathParts[1]; // The username is the second part of the public_id

          if (!acc[username]) {
            acc[username] = [];
          }

          acc[username].push({
            fileName: pathParts[pathParts.length - 1], // File name is the last part of the public_id
            url: file.secure_url,
            format: file.format,
            size: (file.bytes / 1024).toFixed(2) + " KB", // Convert bytes to KB
            type: file.resource_type, // This is where the file type (image, video, etc.) is stored
          });

          return acc;
        }, {});

        // If there's a next page of results, fetch it recursively
        if (result.next_cursor) {
          const nextBatch = await fetchFiles(result.next_cursor);
          result.resources = [...result.resources, ...nextBatch.files];
        }

        return { files: groupedFiles };
      } catch (error) {
        console.error("Error fetching files from Cloudinary:", error);
        throw new Error("Error fetching files.");
      }
    };

    // Fetch files and group them
    const { files } = await fetchFiles();

    console.log(`Total files grouped by username: ${Object.keys(files).length}`);

    return res.status(200).json({
      uniqueId,
      files,
    });
  } catch (error) {
    console.error("Error fetching files from Cloudinary:", error);
    return res.status(500).json({ message: "Error fetching files.", error });
  }
};

module.exports = {
  getFilesByUniqueId,
};
