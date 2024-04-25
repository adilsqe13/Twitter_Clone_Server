require('dotenv').config();
const cloudinary = require('cloudinary').v2;


const deleteImage = async(oldPublicId) =>{
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      cloudinary.uploader.destroy(oldPublicId, (error, result) => {
        if (error) {
          console.error('Error deleting image:', error);
        } else {
            console.log('deleted', result);
        }
      });
}

  module.exports = deleteImage;
    