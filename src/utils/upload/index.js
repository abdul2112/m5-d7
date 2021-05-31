import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import fs from 'fs';

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;
cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
});

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const publicDirectory = join(dirName, '../../../public');

export const parseFile = multer({ storage });

export const uploadFile = (req, res, next) => {
  try {
    const { originalname, buffer } = req.file;
    const extension = extname(originalname);
    const fileName = `${req.params.id}${extension}`;
    const pathToFile = join(publicDirectory, fileName);
    fs.writeFileSync(pathToFile, buffer);
    const link = `http://localhost:3001/${fileName}`;
    req.file = link;
    next();
  } catch (error) {
    console.log(error);
    next(error);
  }
};
