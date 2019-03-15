const levels = {
  error: 0,
  warning: 1,
  info: 2,
  log: 3
};

const checkLevel = (check, level) => {
  if (levels[check] <= levels[level]) {
    return true;
  }
  return false;
};

module.exports = {
  levels,
  checkLevel
};
