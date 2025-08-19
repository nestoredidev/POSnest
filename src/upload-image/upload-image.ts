import { v2 as claudinary } from 'cloudinary';
export const UploadImageProvider = {
  provide: 'CLODINARY',
  useFactory: () => {
    return claudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  },
};
