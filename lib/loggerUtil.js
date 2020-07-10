const levels = {
  error: 0,
  warning: 1,
  notice: 2,
  info: 3,
  log: 4
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
  const errMsg = 'Error - Given level is not valid.'
  + ' Set to level log by default';
  console.error(Error(errMsg));

  return 'log';
};

const setCapLevel = (level) => {
  if (level && (level in levels)) {
    return level;
  }
  if (!level) {
    return 'warning';
  }
  const errMsg = 'Error - Given level is not valid.'
  + ' Set to level warning by default';
  console.error(Error(errMsg));

  return 'warning';
};

const checkOptions = (config) => {
  if (config.capLimit || config.metadata) {
    return true;
  }
};

module.exports = {
  levels,
  checkLevel,
  setLevel,
  setCapLevel,
  checkOptions
};
