
const fs = require('fs');

function exists(fileOrDir) {
  return new Promise(resolve => {
    fs.access(fileOrDir, err => {
      resolve(err ? false : true);
    });
  });
}

function wrapFn(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, ...results) => {
        if (err) reject(err);
        else resolve(...results);
      });
    });
  };
}

module.exports = {
  stat: wrapFn(fs.stat),
  exists,
  readFile: wrapFn(fs.readFile)
};
