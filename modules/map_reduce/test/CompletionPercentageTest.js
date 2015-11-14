/**
 * Created by jaimegiraldo on 29/05/14.
 */

'use strict';


var gunzip, filereader, widgets, map_reduce, output,
  zlib = require('zlib'),
  fs = require('graceful-fs'),
  MapReduce = require('../');

gunzip = zlib.createGunzip();

filereader = fs.createReadStream(__dirname + '/data_reports.log.gz');
filereader.pipe(gunzip);

output = fs.createWriteStream(__dirname + '/completion_percentage.log');

widgets = '';

var mapper_params = [];
mapper_params.push('--widgets=' + widgets);

var opts = {
  pipe_in: gunzip,
  pipe_out: output,
  process_name: 'completion_percentage',
  mapper_args: mapper_params
};

map_reduce = new MapReduce(opts);