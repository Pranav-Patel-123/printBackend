// const mongoose = require("mongoose");

// const fileSchema = new mongoose.Schema({
//   fileName: {
//     type: String,
//     required: true, // Name of the uploaded file
//   },
//   uploadDate: {
//     type: Date,
//     default: Date.now, // Automatically set to current date
//   },
//   layout: {
//     type: String,
//     enum: ["A4", "A3", "Letter", "Legal"], // Example layouts
//     required: true,
//   },
//   pages: {
//     type: Number,
//     required: true,
//     min: 1, // Ensure at least one page is present
//   },
//   color: {
//     type: String,
//     enum: ["Color", "Black-and-white"], // Printing color options
//     required: true,
//   },
//   copies: {
//     type: Number,
//     required: true,
//     min: 1, // Ensure at least one copy is printed
//   },
//   status: {
//     type: String,
//     enum: ["Pending", "In Progress", "Printed"], // Status of the file in the printing queue
//     default: "Pending",
//   },
// });

// module.exports = mongoose.model("File", fileSchema);
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true }, // Original file name
  publicId: { type: String, required: true }, // Cloudinary public ID
  url: { type: String, required: true },     // Cloudinary URL
  layout: { type: String },
  pages: { type: Number },
  color: { type: String },
  copies: { type: Number },
});

module.exports = mongoose.model("File", fileSchema);
