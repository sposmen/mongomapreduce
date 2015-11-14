#!/usr/bin/env node

/** Arguments:
 * --init: Init time (Default: 0)
 * --end: End time (Default: max)
 * --size :  How many portions to divide the data
 */


process.on("uncaughtException", function (err) {
    console.error((new Date()).toUTCString() + " uncaughtException: " + err.message);
    console.error(err.stack);
    process.exit(1);
});


var Lazy = require('lazy'),
    events = require('events'),
    emitter = new events.EventEmitter(),
    actual_widget = null,
    total = 0,
    completed = 0;

processRecord = function (data) {
    var line = data.split('\t'),
        key = line[0].split('|');

    if(actual_widget == null) actual_widget = key[0];

    // Change row
    if(actual_widget !=  key[0]){
        emitter.emit('writeRow', actual_widget + '\t' + total + '\t' + completed + '\n');
        actual_widget = key[0];
        total = 0;
        completed = 0;
    }
    ++total;
    completed = completed + parseInt(line[1]);

};


emitter.on('writeRow', function (line) {
    process.stdout.write(line)
});

// Init line
emitter.emit('writeRow', "widget\ttotal\tcompleted" + '\n');

new Lazy(process.stdin).lines.forEach(function (row) {
    processRecord(row.toString());
}).on('pipe', function () {
    //Last Row
    if (null != actual_widget) {
        emitter.emit('writeRow', actual_widget + '\t' + total + '\t' + completed + '\n');
    }
});