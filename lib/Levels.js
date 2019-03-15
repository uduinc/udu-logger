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

const setLevel = (level) => {
  if (level && (level in levels)) {
    return level;
  }
  if (!level) {
    return 'log';
  }
  // Is it better to return a default level or return an error
  return (console.error(Error('ERROR - Given level is not valid.')));
};

module.exports = {
  levels,
  checkLevel,
  setLevel
};
