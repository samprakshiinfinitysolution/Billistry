





import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials from .env.local
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file from a FormData object to Cloudinary.
 * @param file The File object to upload.
 * @returns A promise that resolves with the secure URL of the uploaded file.
 */
export async function uploadFileToCloudinary(file: File, folder: string): Promise<string> {
    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    return new Promise((resolve, reject) => {
        // Use upload_stream to upload the buffer
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: folder, // Optional: organize uploads in Cloudinary
                resource_type: 'auto',
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(new Error('Failed to upload file.'));
                }
                if (result) {
                    resolve(result.secure_url);
                } else {
                    reject(new Error('Cloudinary upload failed without a specific error.'));
                }
            }
        );

        stream.end(buffer);
    });
}


// --- NEW ---
// Helper function to extract the public_id from a full Cloudinary URL.
// The public_id is what Cloudinary uses to identify an asset for deletion.
// e.g., "https://res.cloudinary.com/.../upload/v123/business_assets/image123.jpg" -> "business_assets/image123"
const getPublicIdFromUrl = (url: string): string | null => {
  const regex = /\/upload\/(?:v\d+\/)?([^\.]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};



// --- NEW ---
/**
 * Deletes an asset from Cloudinary using its public URL.
 * @param url The full public URL of the asset to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteFromCloudinary(url: string): Promise<void> {
  const publicId = getPublicIdFromUrl(url);

  if (!publicId) {
    console.warn("Could not extract public_id from URL, skipping deletion:", url);
    return;
  }

  try {
    console.log(`Attempting to delete asset with public_id: ${publicId}`);
    await cloudinary.uploader.destroy(publicId);
    console.log(`Successfully deleted ${publicId} from Cloudinary.`);
  } catch (error) {
    console.error(`Failed to delete asset ${publicId} from Cloudinary:`, error);
    // In a production app, you might want to log this to a monitoring service
    // but not throw an error, so the rest of the user's settings can still be saved.
  }
}