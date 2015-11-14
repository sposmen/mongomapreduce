/**
 * Created by jaimegiraldo on 29/05/14.
 */

var fs = require('graceful-fs'),
  extend = require('util')._extend;

module.exports = (function () {

  function MapReduce(options) {

    if (!options.process_name) {
      throw Error("You need to define a process name");
    }

    var defaultOpts = {
      pipe_in: process.stdin,
      pipe_out: process.stdout,
      mapper_args:[],
      reducer_args:[],
      process_dir: __dirname + '/MapReduceProcess/' + options.process_name
    };

    this.opts = extend(defaultOpts, options);

    this.mapper = this.opts.process_dir + "/mapper.js";
    this.reducer = this.opts.process_dir + "/reducer.js";
    if (!fs.existsSync(this.opts.process_dir) || !fs.existsSync(this.mapper) || !fs.existsSync(this.reducer)) {
      throw Error("The process directory doesn't exists or doesn't have mapper/reducer");
    }

    this.init();
  }

  MapReduce.prototype.init = function () {
    var spawn, mapper, sorter, reducer;
    spawn = require("child_process").spawn;

    // Generate Child process
    mapper = spawn(this.mapper, this.opts.mapper_args, {stdio: 'pipe'});
    // TODO improve the sorter based on key
    sorter = spawn('sort', ['-u'], {stdio: 'pipe'});
    reducer = spawn(this.reducer, this.opts.reducer_args, {stdio: 'pipe'});

    this.opts.pipe_in.pipe(mapper.stdin);
    mapper.stdout.pipe(sorter.stdin);
    sorter.stdout.pipe(reducer.stdin);
    reducer.stdout.pipe(this.opts.pipe_out);
  };

  return MapReduce;
})();