export const notFoundHandler = (req, res) => {
  res.status(404).json({
    message: "API route not found.",
  });
};

export const errorHandler = (error, req, res, next) => {
  console.error(error);

  const statusCode =
    error.code === 11000
      ? 409
      : error.name === "ValidationError" || error.name === "CastError"
        ? 400
        : 500;

  const message =
    error.code === 11000
      ? "Duplicate record."
      : error.name === "ValidationError" || error.name === "CastError"
        ? error.message
        : process.env.NODE_ENV === "production"
          ? "Server error."
          : error.message;

  res.status(statusCode).json({ message });
};
