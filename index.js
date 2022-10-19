const yargs = require('yargs');
const path = require('path');
const util = require("util");
const fs = require('fs');
const { mkdir, readdir, stats, copyFile, rm } = require('./modules/fs')

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
  thisFolder: function() {
    if(argv.delete) {
      return path.normalize(path.resolve(__dirname, argv.removeFolder))
    }
  }
}

async function sorter(src) {
  if(!config.isDelete) {
    const files = await readdir(src);

    for(const file of files) {
      const currentPath = path.resolve(src, file);
      const stat = await stats(currentPath);

      if(stat.isDirectory()) {
        await sorter(currentPath)
      } else {
        const firstLetter = path.basename(currentPath, '.*')[0];
        const innerPath = path.resolve(config.dist, firstLetter.toUpperCase());
        const newPath = path.resolve(innerPath, path.basename(currentPath));

        await mkdir(config.dist)
        await mkdir(innerPath)
        await copyFile(currentPath, newPath)
      }
    }
  }
}

(async function() {
  try {
    await sorter(config.entry)
  } catch (err) {
    console.log(err)
  }
}())

async function deleteFolder(src) {
  await rm(src)
}

async function checkExistFolder() {
  if(fs.existsSync(config.thisFolder())) {
    await deleteFolder(config.thisFolder());

    console.log(`Папка ${argv.removeFolder} удалена!`);
  } else {
    console.log(`Папки ${argv.removeFolder} не существует`);
  }
}

(async function() {
  try {
    if(config.isDelete && config.thisFolder()) {
      await checkExistFolder();
    } else if(config.isDelete) {
      console.log('Чтобы удалить папку нужно дописать -r и выбрать папку, которую хотите удалить');
    }
  } catch(err) {
    console.log(err)
  }
}())