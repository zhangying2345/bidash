/**
 * Supply some util functions
 */
const Fs = require('fs');
const Path = require('path');

const ArgsParser = require('yargs-parser');

// ref: https://www.npmjs.com/package/yargs-parser
const ArgsParserOption = {
  configuration: {
    // true in default, treat '-abc' as -a, -b, -c; change to false, treat as 'abc'
    'short-option-groups': false
  }
};
const CliArgs = ArgsParser(process.argv, ArgsParserOption);
// log('Arguments: ' + JSON.stringify(CliArgs));

if (hasArg(CliArgs.VV)) {
  CliArgs.V = true;
}

if (hasArg(CliArgs.VVV)) {
  CliArgs.VV = true;
  CliArgs.V = true;
}

function root(relativePath) {
  const absolutePath = Path.join(__dirname, relativePath);
  // log(absolutePath);

  return absolutePath;
}

// if the passed arg dosn't exist or it has value or is true, return true
function isDefaultArg(arg) {
  return (arg || (undefined === arg));
}

// if the passed arg exist and it has value or is true, return true
function hasArg(arg) {
  return ((arg !== undefined) && arg);
}


function log(message){
  // with --verbose or -V
  if (hasArg(CliArgs.verbose) || hasArg(CliArgs.V)) {
    console.log(message);
  }
}

function logV(message){
  // -VV
  if (hasArg(CliArgs.VV)) {
    console.log(message);
  }
}

function logVV(message){
  // -VVV
  if (hasArg(CliArgs.VVV)) {
    console.log(message);
  }
}

function hasProcessFlag(flag) {
  const argvString = process.argv.join('');
  // log('Joined process argv string: ' + argvString);
  return argvString.indexOf(flag) > -1;
}

function hasNpmWebpack() {
  return process.env.npm_lifecycle_event && (process.env.npm_lifecycle_event.indexOf('webpack') > -1);
}

module.exports = {
  ArgsParserOption,
  CliArgs,
  root,
  log,
  logV,
  logVV,
  hasNpmWebpack,
  hasProcessFlag,
  isDefaultArg,
  hasArg
};
