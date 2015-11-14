/**
 * Created by jaimegiraldo on 29/05/14.
 */
process.on("uncaughtException", function (err) {
  console.error((new Date()).toUTCString() + " uncaughtException: " + err.message);
  console.error(err.stack);
  process.exit(1);
});

var zlib = require('zlib'),
  fs = require('graceful-fs'),
  MapReduce = require('../');

gunzip = zlib.createGunzip();

filereader = fs.createReadStream(__dirname + '/data_reports.log.gz');
filereader.pipe(gunzip);

output = fs.createWriteStream(__dirname + '/session_length.log');

min = 0;
min = 's';
max = 10;
max = 'f';
size = 5;
size = 'g';


var reducer_params = [];
if (!isNaN(min)) reducer_params.push('--init=' + min);
if (!isNaN(max)) reducer_params.push('--end=' + max);
if (!isNaN(size)) reducer_params.push('--size=' + size);

var opts = {
  pipe_in: gunzip,
  pipe_out: output,
  process_name: 'session_length',
  reducer_args: reducer_params
};

map_reduce = new MapReduce(opts);