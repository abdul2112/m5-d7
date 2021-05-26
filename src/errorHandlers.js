export const catchAllErrorHandler = (err, req, res, next) => {
  //   res.status(500).send('Generic Server Error');
  err
    ? res.status(err.status).send({ message: err.message })
    : res.status(500).send({ message: 'Something went wrong!' });
};
