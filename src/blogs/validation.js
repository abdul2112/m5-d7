import { body, checkSchema, validationResult } from 'express-validator';

// export const blogpostValidation = [];

const schema = {
  title: {
    in: ['body'],
    isString: {
      errorMessage: 'title validation failed, type must be string',
    },
  },
  category: {
    in: ['body'],
    isString: {
      errorMessage: 'category validation failed, type must be string',
    },
  },
  content: {
    in: ['body'],
    isString: {
      errorMessage: 'content validation failed, type must be string',
    },
  },
  'author.name': {
    in: ['body'],
    isString: {
      errorMessage: 'author.name validation failed, type must be string',
    },
  },
  'author.avatar': {
    in: ['body'],
    isString: {
      errorMessage: 'author.avatar validation failed, type must be string',
    },
  },
  'readTime.value': {
    in: ['body'],
    isNumeric: {
      errorMessage: 'readTime.value validation failed, type must be numeric',
    },
  },
  'readTime.unit': {
    in: ['body'],
    isString: {
      errorMessage: 'readTime.unit validation failed, type must be string',
    },
  },
  cover: {
    in: ['body'],
    isString: {
      errorMessage: 'cover validation failed, type must be string',
    },
  },
};

const commentSchema = {
  text: {
    isString: {
      errorMessage: 'Text field is required for comment',
    },
  },
  userName: {
    isString: {
      errorMessage: 'User name is required for comment',
    },
  },
};

export const checkCommentSchema = checkSchema(commentSchema);

export const checkBlogPostSchema = checkSchema(schema);

export const checkValidationResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Blog post validation failed');
    error.status = 400;
    error.errors = errors.array();
    next(error);
  }
  next();
};
