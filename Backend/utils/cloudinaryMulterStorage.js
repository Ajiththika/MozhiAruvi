/**
 * Custom Multer storage engine for Cloudinary v2.
 * Replaces multer-storage-cloudinary which only supports Cloudinary v1.
 */
export function createCloudinaryStorage({ cloudinary, params = {} }) {
  return {
    _handleFile(req, file, cb) {
      const uploadParams =
        typeof params === 'function' ? params(req, file) : params;

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadParams,
        (error, result) => {
          if (error) return cb(error);
          cb(null, {
            path: result.secure_url,
            filename: result.public_id,
            public_id: result.public_id,
            ...result,
          });
        }
      );

      file.stream.pipe(uploadStream);
    },

    _removeFile(req, file, cb) {
      const resourceType = file.resource_type || 'image';
      cloudinary.uploader.destroy(file.filename, { resource_type: resourceType }, cb);
    },
  };
}
