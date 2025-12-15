import { ENV_CONFIG } from "@/env_config";

const CLOUDINARY_CLOUD_NAME = ENV_CONFIG.CLOUDINARY.NAME;
const CLOUDINARY_UNSIGNED_UPLOAD_PRESET = ENV_CONFIG.CLOUDINARY.UNSIGNED_PRESET;

const CloudinaryService = {
  async uploadImage(fileUri: string, fileType = 'image/jpeg') {
    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
      uri: fileUri,
      type: fileType,
      name: 'upload.jpg',
    });
    formData.append('upload_preset', CLOUDINARY_UNSIGNED_UPLOAD_PRESET);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    // data.secure_url contains the uploaded image URL
    return data.secure_url;
  },
};

export default CloudinaryService;