import express from 'express';
import listEndpoints from 'express-list-endpoints';
import cors from 'cors';
import authorsRouter from './authors/index.js';
import blogsRouter from './blogs/index.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { catchAllErrorHandler } from './errorHandlers.js';

const fileName = fileURLToPath(import.meta.url);
const dirName = dirname(fileName);
const publicDirectory = join(dirName, '../public');

const server = express();

const port = 3001;

// ******** GLOBAL MIDDLEWARES ************ //
server.use(cors());

server.use(express.json());

server.use(express.static(publicDirectory));

// ******** GLOBAL MIDDLEWARES ************ //

// ******** ROUTES ************ //

server.use('/authors', authorsRouter);

server.use('/blogs', blogsRouter);

// ******** ROUTES ************ //

// ******** ERROR MIDDLEWARES ************ //

server.use(catchAllErrorHandler);

// ******** ERROR MIDDLEWARES ************ //

console.table(listEndpoints(server));

server.listen(port, () => {
  console.log('Server is running on port:', port);
});

// server.on('error', (error) =>
//   console.log(`server is not running due to ${error}`)
// );
