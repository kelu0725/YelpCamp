module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

//Video 436handling async function
