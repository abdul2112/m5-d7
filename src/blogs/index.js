import express from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parseFile, uploadFile } from '../utils/upload/index.js';
import uniqid from 'uniqid';
import createError from 'http-errors';
import {
  checkBlogPostSchema,
  checkCommentSchema,
  checkValidationResult,
} from './validation.js';

/*
****************** Blogposts CRUD ********************
1. CREATE → POST http://localhost:3001/blogposts (+ body)
2. READ → GET http://localhost:3001/blogposts (+ optional query parameters)
3. READ → GET http://localhost:3001/blogposts/:id
4. UPDATE → PUT http://localhost:3001/blogposts/:id (+ body)
5. DELETE → DELETE http://localhost:3001/blogposts/:id
*/

const fileName = fileURLToPath(import.meta.url);
// console.log(fileName);

const dirName = dirname(fileName);
// console.log(dirName);

const blogsFilePath = join(dirName, 'blogs.json');
// console.log(blogsFilePath);

const blogsJsonPath = join(
  dirname(fileURLToPath(import.meta.url)),
  'blogs.json'
);
// console.log(blogsJsonPath, '==> oneLiner');

const getBooks = () => {
  const content = fs.readFileSync(blogsJsonPath);
  return JSON.parse(content);
};

const writeBooks = (data) => {
  const content = fs.writeFileSync(blogsJsonPath, JSON.stringify(data));
  return JSON.parse(content);
};

const blogsRouter = express.Router();

// get all blogs
blogsRouter.get('/', async (req, res, next) => {
  try {
    // 1. read request body
    const fileAsBuffer = fs.readFileSync(blogsFilePath);

    const fileAsString = fileAsBuffer.toString();

    const fileAsJSON = JSON.parse(fileAsString);
    // console.log(fileAsJSON);

    // const oneLiner = JSON.parse(fs.readFileSync(blogsFilePath.toString()));
    // console.log(oneLiner);

    // 2. send the content as a response
    res.send(fileAsJSON);
  } catch (error) {
    res.send({ message: error.message });
  }
});

// create blog
blogsRouter.post(
  '/',
  checkBlogPostSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {
      const blog = {
        id: uniqid(),
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const fileAsBuffer = fs.readFileSync(blogsFilePath);

      const fileAsString = fileAsBuffer.toString();

      const fileAsJSONArray = JSON.parse(fileAsString);

      fileAsJSONArray.push(blog);

      fs.writeFileSync(blogsFilePath, JSON.stringify(fileAsJSONArray));

      res.send(blog);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
);

// get single blog
blogsRouter.get('/:id', async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogsFilePath);

    const fileAsString = fileAsBuffer.toString();

    const fileAsJSONArray = JSON.parse(fileAsString);

    const blog = fileAsJSONArray.find((blog) => blog.id === req.params.id);

    if (!blog) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.id} id not found!` });
    }
    res.send(blog);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

blogsRouter.get('/:id/comments', async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogsFilePath);

    const fileAsString = fileAsBuffer.toString();

    const fileAsJSONArray = JSON.parse(fileAsString);

    const blog = fileAsJSONArray.find((blog) => blog.id === req.params.id);

    if (!blog) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.id} id not found!` });
    }
    blog.comments = blog.comments || [];
    res.send(blog.comments);
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// delete blog
blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogsFilePath);

    const fileAsString = fileAsBuffer.toString();

    let fileAsJSONArray = JSON.parse(fileAsString);

    const blog = fileAsJSONArray.find((blog) => blog.id === req.params.id);
    if (!blog) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.id} id not found!` });
    }
    fileAsJSONArray = fileAsJSONArray.filter(
      (blog) => blog.id !== req.params.id
    );

    fs.writeFileSync(blogsFilePath, JSON.stringify(fileAsJSONArray));

    res.status(204).send();
  } catch (error) {
    res.send(500).send({ message: error.message });
  }
});

// update blog
blogsRouter.put('/:id', async (req, res, next) => {
  try {
    const fileAsBuffer = fs.readFileSync(blogsFilePath);

    const fileAsString = fileAsBuffer.toString();

    let fileAsJSONArray = JSON.parse(fileAsString);

    const blogIndex = fileAsJSONArray.findIndex(
      (blog) => blog.id === req.params.id
    );
    if (!blogIndex === -1) {
      res
        .status(404)
        .send({ message: `blog with ${req.params.id} id not found!` });
    }
    const previousblogData = fileAsJSONArray[blogIndex];

    const changedBlog = {
      ...previousblogData,
      ...req.body,
      updatedAt: new Date(),
      id: req.params.id,
    };

    fileAsJSONArray[blogIndex] = changedBlog;

    fs.writeFileSync(blogsFilePath, JSON.stringify(fileAsJSONArray));

    res.send(changedBlog);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

blogsRouter.put(
  '/:id/comment',
  checkCommentSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {
      const { text, userName } = req.body;

      const comment = { id: uniqid(), text, userName, createdAt: new Date() };

      const fileAsBuffer = fs.readFileSync(blogsFilePath);

      const fileAsString = fileAsBuffer.toString();

      let fileAsJSONArray = JSON.parse(fileAsString);

      const blogIndex = fileAsJSONArray.findIndex(
        (blog) => blog.id === req.params.id
      );
      if (!blogIndex === -1) {
        res
          .status(404)
          .send({ message: `blog with ${req.params.id} id not found!` });
      }
      const previousblogData = fileAsJSONArray[blogIndex];

      previousblogData.comments = previousblogData.comments || [];

      const changedBlog = {
        ...previousblogData,
        ...req.body,
        comments: [...previousblogData.comments, comment],
        updatedAt: new Date(),
        id: req.params.id,
      };

      fileAsJSONArray[blogIndex] = changedBlog;

      fs.writeFileSync(blogsFilePath, JSON.stringify(fileAsJSONArray));

      res.send(changedBlog);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  }
);

blogsRouter.put(
  '/:id/cover',
  parseFile.single('angry'),
  // uploadFile,
  async (req, res, next) => {
    try {
      const fileAsBuffer = fs.readFileSync(blogsFilePath);

      const fileAsString = fileAsBuffer.toString();

      let fileAsJSONArray = JSON.parse(fileAsString);

      const blogIndex = fileAsJSONArray.findIndex(
        (blog) => blog.id === req.params.id
      );
      if (!blogIndex === -1) {
        res
          .status(404)
          .send({ message: `blog with ${req.params.id} id not found!` });
      }
      const previousblogData = fileAsJSONArray[blogIndex];

      const changedBlog = {
        ...previousblogData,
        cover: req.file.path,
        updatedAt: new Date(),
        id: req.params.id,
      };

      fileAsJSONArray[blogIndex] = changedBlog;

      fs.writeFileSync(blogsFilePath, JSON.stringify(fileAsJSONArray));

      res.send(changedBlog);
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: error.message });
    }
  }
);
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

// blogsRouter.post('/', (req, res) => {
//   // 1. read request body
//   const newblog = { ...req.body, createdAt: new Date(), _id: uniqid() };
//   console.log(newblog);
//   // 2. read the old content of the file blogs.json
//   const blogs = JSON.parse(fs.readFileSync(blogsFilePath).toString());
//   // 3. push the newblog into blogs array
//   blogs.push(newblog);
//   // 4. write the array back into the file blogs.json
//   fs.writeFileSync(blogsFilePath, JSON.stringify(blogs));
//   // 5. send back proper response
//   res.status(201).send(newblog._id);
// }); // (URL, ROUTE HANDLER), Route handler (req, res) => {}

// blogsRouter.get('/', (req, res) => {
//   // 1. read blogs.json content
//   // 2. send the content as a response
// });

blogsRouter.get('/:id', (req, res) => {
  console.log(req.params);

  // 1. read the content of the file

  // 2. find the one with the correspondant id

  // 3. send it as a response
});

blogsRouter.put('/:id', (req, res) => {
  // 1. read the old content of the file
  // 2. modify the specified blog
  // 3. write the file with the updated list
  // 4. send a proper response
});

blogsRouter.delete('/:id', (req, res) => {
  // 1. read the old content of the file
  // 2. filter out the specified id
  // 3. write the remaining blogs into the file blogs.json
  // 4. send back a proper response
});

export default blogsRouter;
