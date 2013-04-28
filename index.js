module.exports = jsify;
module.exports.str = str;

function jsify(text){
  return 'module.exports = "' + str(text) + '";';
}

function str(text){
  return text.replace(/\"/g, '\\"').replace(/\n/g, ' ').replace(/\s$/, '').replace(/\s+/g, ' ');
}
