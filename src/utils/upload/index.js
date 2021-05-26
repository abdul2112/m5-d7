import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import multer from 'multer';
import fs from 'fs';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const publicDirectory = join(dirName, '../../../public');

export const parseFile = multer();

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
