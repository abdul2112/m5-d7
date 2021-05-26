import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import uniqid from 'uniqid';
import { parseFile, uploadFile } from '../utils/upload/index.js';

const fileName = fileURLToPath(import.meta.url);
// console.log(fileName);

const dirName = dirname(fileName);
// console.log(dirName);

const authorsFilePath = join(dirName, 'authors.json');
// console.log(authorsFilePath);

const authorsJsonPath = join(
  dirname(fileURLToPath(import.meta.url)),
  'authors.json'
);
// console.log(authorsJsonPath, '==> oneLiner');

const getBooks = () => {
  const content = fs.readFileSync(authorsJsonPath);
  return JSON.parse(content);
};

const writeBooks = (data) => {
  const content = fs.writeFileSync(authorsJsonPath, JSON.stringify(data));
  return JSON.parse(content);
};

const authorsRouter = express.Router();

// get all authors
authorsRouter.get('/', async (req, res, next) => {
  try {
    // 1. read request body
    const fileAsBuffer = fs.readFileSync(authorsFilePath);

    const fileAsString = fileAsBuffer.toString();

    const fileAsJSON = JSON.parse(fileAsString);
    // console.log(fileAsJSON);

    // const oneLiner = JSON.parse(fs.readFileSync(authorsFilePath.toString()));
    // console.log(oneLiner);

    // 2. send the content as a response
    res.send(fileAsJSON);
  } catch (error) {
    res.send({ message: error.message });
  }
});

// create author
authorsRouter.post('/', async (req, res, next) => {
  try {
    const { name, surname, email, dateOfBirth } = req.body;

    const author = {
      id: uniqid(),
      name,
      surname,
      email,
      dateOfBirth,
      avatar: `https://ui-avatars.com/api/?name=${name}+${surname}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const fileAsBuffer = fs.readFileSync(authorsFilePath);

    const fileAsString = fileAsBuffer.toString();

    const fileAsJSONArray = JSON.parse(fileAsString);

    fileAsJSONArray.push(author);

    fs.writeFileSync(authorsFilePath, JSON.stringify(fileAsJSONArray));

    res.send(author);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// get single author
authorsRouter.get('/:id', async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(authorsFilePath);

    const fileAsString = fileAsBuffer.toString();

    const fileAsJSONArray = JSON.parse(fileAsString);

    const author = fileAsJSONArray.find(
      (author) => author.id === req.params.id
    );
    if (!author) {
      res
        .status(404)
        .send({ message: `Author with ${req.params.id} id not found!` });
    }
    res.send(author);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// delete author
authorsRouter.delete('/:id', async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(authorsFilePath);

    const fileAsString = fileAsBuffer.toString();

    let fileAsJSONArray = JSON.parse(fileAsString);

    const author = fileAsJSONArray.find(
      (author) => author.id === req.params.id
    );
    if (!author) {
      res
        .status(404)
        .send({ message: `Author with ${req.params.id} id not found!` });
    }
    fileAsJSONArray = fileAsJSONArray.filter(
      (author) => author.id !== req.params.id
    );
    fs.writeFileSync(authorsFilePath, JSON.stringify(fileAsJSONArray));
    res.status(204).send();
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// update author
authorsRouter.put('/:id', async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(authorsFilePath);

    const fileAsString = fileAsBuffer.toString();

    let fileAsJSONArray = JSON.parse(fileAsString);

    const authorIndex = fileAsJSONArray.findIndex(
      (author) => author.id === req.params.id
    );
    if (!authorIndex === -1) {
      res
        .status(404)
        .send({ message: `Author with ${req.params.id} id not found!` });
    }
    const previousAuthorData = fileAsJSONArray[authorIndex];
    const changedAuthor = {
      ...previousAuthorData,
      ...req.body,
      updatedAt: new Date(),
      id: req.params.id,
    };
    fileAsJSONArray[authorIndex] = changedAuthor;
    fs.writeFileSync(authorsFilePath, JSON.stringify(fileAsJSONArray));
    res.send(changedAuthor);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

authorsRouter.put(
  '/:id/lenovo',
  parseFile.single('lenovo'),
  uploadFile,
  async (req, res, next) => {
    try {
      const fileAsBuffer = fs.readFileSync(authorsFilePath);

      const fileAsString = fileAsBuffer.toString();

      let fileAsJSONArray = JSON.parse(fileAsString);

      const authorIndex = fileAsJSONArray.findIndex(
        (author) => author.id === req.params.id
      );
      if (!authorIndex === -1) {
        res
          .status(404)
          .send({ message: `Author with ${req.params.id} id not found!` });
      }
      const previousAuthorData = fileAsJSONArray[authorIndex];
      const changedAuthor = {
        ...previousAuthorData,
        avatar: req.file,
        updatedAt: new Date(),
        id: req.params.id,
      };
      fileAsJSONArray[authorIndex] = changedAuthor;
      fs.writeFileSync(authorsFilePath, JSON.stringify(fileAsJSONArray));
      res.send(changedAuthor);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
);

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// authorsRouter.post('/', (req, res) => {
//   // 1. read request body
//   const newAuthor = { ...req.body, createdAt: new Date(), _id: uniqid() };
//   console.log(newAuthor);
//   // 2. read the old content of the file authors.json
//   const authors = JSON.parse(fs.readFileSync(authorsFilePath).toString());
//   // 3. push the newauthor into authors array
//   authors.push(newAuthor);
//   // 4. write the array back into the file authors.json
//   fs.writeFileSync(authorsFilePath, JSON.stringify(authors));
//   // 5. send back proper response
//   res.status(201).send(newAuthor._id);
// }); // (URL, ROUTE HANDLER), Route handler (req, res) => {}

// authorsRouter.get('/', (req, res) => {
//   // 1. read authors.json content
//   // 2. send the content as a response
// });

authorsRouter.get('/:id', (req, res) => {
  console.log(req.params);

  // 1. read the content of the file

  // 2. find the one with the correspondant id

  // 3. send it as a response
});

authorsRouter.put('/:id', (req, res) => {
  // 1. read the old content of the file
  // 2. modify the specified author
  // 3. write the file with the updated list
  // 4. send a proper response
});

authorsRouter.delete('/:id', (req, res) => {
  // 1. read the old content of the file
  // 2. filter out the specified id
  // 3. write the remaining authors into the file authors.json
  // 4. send back a proper response
});

export default authorsRouter;
