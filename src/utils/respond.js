module.exports = (success, message, error = {}) => {
  error = success ? "" : {};

  return {
    success,
    message,
    ...error
  };
};
