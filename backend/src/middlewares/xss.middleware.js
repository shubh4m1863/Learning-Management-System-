const xss = require('xss');

const cleanObject = (obj) => {
  if (obj === null || typeof obj !== 'object') return;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        cleanObject(obj[key]);
      }
    }
  }
};

const xssMiddleware = () => {
  return (req, res, next) => {
    if (req.body) cleanObject(req.body);
    if (req.query) cleanObject(req.query);
    if (req.params) cleanObject(req.params);
    next();
  };
};

module.exports = xssMiddleware;
