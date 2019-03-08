const Console = function () {
  this.log = (data) => {
    console.log(data);
  };

  this.warn = (data) => {
    console.warn(data);
  };

  this.error = (data) => {
    console.error(data);
  };
};

module.exports = Console;
