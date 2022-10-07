const yargs = require('yargs')
const path = require('path');
const fs = require('fs');

const argv = yargs
  .usage('Usage: node $0 [option]')
  .help('help')
  .alias('help', 'h')
  .version('0.0.1')
  .alias('version', 'v')
  .option('entry', {
    alias: 'e',
    describe: 'Указывает путь к читаемой директории',
    demandOption: true
  })
  .option('dist', {
    alias: 'd',
    describe: 'Путь куда выложить',
    default: './dist'
  })
  .option('delete', {
    alias: 'D',
    describe: 'Удалять ли?',
    default: false,
    boolean: true
  })
  .option('removeFolder', {
    alias: 'r',
    describe: 'Выбрать папку, которую нужно удалить',
    choices: ['dist', 'src']
  })
  .argv

const config = {
  entry: path.normalize(path.resolve(__dirname, argv.entry)),
  dist: path.normalize(path.resolve(__dirname, argv.dist)),
  isDelete: argv.delete,
  thisFolder: argv.removeFolder
}

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

function sorter(src) {
  if(!config.isDelete) {
    fs.readdir(src, (err, files) => {
      if(err) throw err

      files.forEach((file) => {
        const currentPath = path.resolve(src, file);

        fs.stat(currentPath, (err, stat) => {
          if(err) throw err

          if(stat.isDirectory()) {
            sorter(currentPath)
          } else {
            createDir(config.dist, () => {
              const firstLetter = path.basename(currentPath, '.*')[0];
              const innerPath = path.resolve(config.dist, firstLetter.toUpperCase());

              createDir(innerPath, () => {
                fs.copyFile(currentPath, path.resolve(innerPath, path.basename(currentPath)), (err) => {
                  if(err) throw err
                })
              })
            })
          }
        })
      })
    })
  }
}

function deleteFolder(src) {
  fs.readdir(src, (err, files) => {
    if(err) throw err

    files.forEach((file) => {
      let currentPath = path.resolve(src, file);

      fs.stat(currentPath, (err, stat) => {
        if(err) throw err

        if(!stat.isDirectory()) {
          fs.unlink(currentPath, err => {
            if(err) throw err
          })
        } else {
          deleteFolder(currentPath)

          fs.rm(src, {recursive: true,}, (error) => {
            if (error) {
              console.log(error);
            }
          });
        }
      })
    })
  })

}

sorter(config.entry)

if(config.isDelete) {
  if(config.thisFolder === 'src') {
    deleteFolder(config.entry)
  } else {
    deleteFolder(config.dist)
  }

  console.log('Папка удалена!')
}
