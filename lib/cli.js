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

  var contentsOf = comp(globs,
                        saveIfSingle(filenames, target),
                        flatten,
                        readFiles,
                        toString,
                        toJS);

  contentsOf(filenames, function(error, contents){
    if(error) throw error;

    if(/\.$/.test(target)) target = target.slice(0, target.length - 2);

    var names = namesOf(filenames);

    contents = contents.map(function(el, ind){
      return 'exports["' + names[ind] + '"] = ' + jsify.str(el);
    });

    write(target, contents.join('\n'));

  });

}

function flatten(l, callback){
  callback(undefined, sflatten(l));
}

function namesOf(filenames){
  var dirname = path.dirname(shortest(filenames)) + '/';

  return filenames
    .map(function(filename){
      if(filename.slice(-3) == '.js') filename = filename.slice(0, -3);

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

      write(target, jsify(content.toString()));

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


function toJS(text, callback){
  callback(undefined, text.map(jsify));
}


function toString(files, callback){
  callback(undefined, files.map(function(f){
    return f.toString();
  }));
}

function write(target, content){
  fs.writeFile(target, content, function(error){
    if(error) throw error;
    process.stdout.write('\n    ' + target + ' was written.\n\n');
  });
}
