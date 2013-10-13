var jsify     = require('../'),
    comp      = require('comp'),
    partial   = require('new-partial'),
    sflatten  = require('flatten-array'),
    map       = require('map'),
    fs        = require('fs'),
    path      = require('path'),
    glob      = require('glob'),

    readFiles = partial(map, fs.readFile),
    globs     = partial(map, glob),

    isSingle   = false;

module.exports = cli;

function cli(filenames, argv){
  var target = argv.out;

  var contentsOf = comp(readDirectories,
                        flatten,
                        globs,
                        saveIfSingle(filenames, target),
                        flatten,
                        updateFilenames,
                        readFiles,
                        toString);

  contentsOf(filenames, function(error, contents){
    if(error) throw error;

    if(/\.$/.test(target)) target = target.slice(0, target.length - 2);

    var names = namesOf(filenames);

    contents = contents.map(function(el, ind){
      return 'exports["' + names[ind] + '"] = "' + jsify.str(el) + '"';
    });

    var output = contents.join('\n');

    if (!target) return console.log(output);

    write(target, output);

  });

  function updateFilenames(globbed, callback){
    filenames = globbed;
    callback(undefined, filenames);
  }

}

function flatten(l, callback){
  callback(undefined, sflatten(l));
}

function namesOf(filenames){
  var dirname = path.dirname(shortest(filenames)) + '/';

  return filenames
    .map(function(filename){
      if(filename.indexOf(dirname) == 0) {
        return filename.slice(dirname.length);
      }

      return filename;
    });
}

function saveIfSingle(filenames, target){
  return function(input, callback){
    if(input.length > 1 || input[0][0] != filenames[0]) return callback(undefined, input);

    fs.readFile(filenames[0], function(error, content){
      if(error) throw error;

      var output = jsify(content.toString());

      if (!target) return console.log(output);

      write(target, output);

    });
  }
}

function shortest(array){
  var len = -1,
      ret;

  array.forEach(function(el){
    if(len == -1 || el.length < len){
      len = el.length;
      ret = el;
    }
  });

  return ret;
}

function toString(files, callback){
  callback(undefined, files.map(function(f){
    return f.toString();
  }));
}

function write(target, content){
  fs.writeFile(target, content, function(error){
    if(error) throw error;
    process.stdout.write('\n  ' + target + ' was written.\n\n');
  });
}

function readDirectories (files, callback) {
  callback(undefined, files.map(directoryContent));
}

function directoryContent (dir) {
  if (!fs.existsSync(dir)) return dir;
  if (!fs.lstatSync(dir).isDirectory()) return dir;

  return fs.readdirSync(dir).map(function (filename) {
    return path.join(dir, filename);
  });
}
