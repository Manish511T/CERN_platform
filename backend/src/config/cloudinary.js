import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import multer from 'multer'
import { env } from './env.js'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key:    env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'cern/sos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'mp3', 'wav'],
    resource_type: 'auto',
  },
})

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
})

export default cloudinary