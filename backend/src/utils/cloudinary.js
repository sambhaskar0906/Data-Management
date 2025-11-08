import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log('Cloudinary Upload - File Path:', localFilePath);

    if (!localFilePath || !fs.existsSync(localFilePath)) {
      console.log("No file found at:", localFilePath);
      return null;
    }

    console.log('Starting Cloudinary upload...');
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "bulk-mail-images" // Optional: organize images in folder
    });

    console.log('Cloudinary Upload Success:', response.secure_url);

    // Delete local file after upload
    fs.unlinkSync(localFilePath);
    console.log('Local file deleted');

    return response;

  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);

    // Delete local file if upload fails
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
      console.log('Local file deleted after error');
    }

    return null;
  }
};

export { uploadOnCloudinary };