const httpError = (message, errorCode) => {
  const error = new Error(message);
  error.code = errorCode;
  return error;
};

// class HttpError extends Error {
//     constructor(message, errorCode) {
//       super(message); // Add a "message" property
//       this.code = errorCode; // Adds a "code" property
//     }
//   }

module.exports = httpError;
