import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      return null;
    }

    const ext = path.extname(localFilePath).toLowerCase();
    const isPdf = ext === ".pdf";

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",          // ✅ PDF + Images both
      format: isPdf ? "pdf" : undefined,
      folder: isPdf ? "member-documents" : "member-images",
      use_filename: true,
      unique_filename: false,
    });

    fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary Upload Error:", error.message);
    return null;
  }
};

export { uploadOnCloudinary };
