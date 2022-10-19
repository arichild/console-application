const fs = require('fs');

function createDir(src, cb) {
  if(!fs.existsSync(src)) {
    fs.mkdir(src, (err) => {
      if(err) throw err
    })

    cb()
  } else {
    cb()
  }
}

module.exports = {
  mkdir(src) {
    return new Promise((resolve, reject) => {
      createDir(src, (err) => {
        if(err) reject(err)

        resolve()
      })
    })
  },

  readdir(src) {
    return new Promise((resolve, reject) => {
      fs.readdir(src, (err, files) => {
        if(err) reject(err)

        resolve(files)
      })
    })
  },

  stats(src) {
    return new Promise((resolve, reject) => {
      fs.stat(src, (err, stat) => {
        if(err) reject(err)

        resolve(stat)
      })
    })
  },

  copyFile(currentPath, newPath) {
    return new Promise((resolve, reject) => {
      fs.copyFile(currentPath, newPath, (err) => {
        if(err) reject(err)

        resolve()
      })
    })
  },

  rm(src) {
    return new Promise((resolve, reject) => {
      fs.rm(src, { recursive: true, force: true }, err => {
        if(err) reject(err)

        resolve()
      });
    })
  }
}