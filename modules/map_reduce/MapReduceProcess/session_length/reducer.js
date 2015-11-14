#!/usr/bin/env node

/** Arguments:
 * --init: Init time (Default: 0)
 * --end: End time (Default: max)
 * --size :  How many portions to divide the data
 */

'use strict';
var Lazy = require('lazy'),
    events = require('events'),
    emitter = new events.EventEmitter(),
    argv = require('minimist')(process.argv.slice(2)),
    init = typeof argv.init != 'undefined' ? argv.init : 0,
    actual_row_init = init,
    end = typeof argv.end != 'undefined' ? argv.end : null,
    size = typeof argv.size != 'undefined' ? argv.size : 5,
    learners = 0;

var processRecord;
processRecord = function (data) {
    var line = data.split('\t'),
        session_length = parseInt(line[1])/60;

    if (session_length < init) return;
    if (end != null && session_length > end) return;

    // Change row
    while (session_length >= actual_row_init + size) {
        var time = actual_row_init + "-" + (actual_row_init + size);
        emitter.emit('writeRow', time + '\t' + learners + '\n');
        actual_row_init = actual_row_init + size;
        learners = 0;
    }

    if (session_length < (actual_row_init + size) && session_length >= actual_row_init) {
        ++learners;
    }
};


emitter.on('writeRow', function (line) {
    process.stdout.write(line)
});

// Init line
emitter.emit('writeRow', "time\tlearners" + '\n');

new Lazy(process.stdin).lines.forEach(function (row) {
    processRecord(row.toString());
}).on('pipe', function () {
    //Last Row
    var time = actual_row_init + "-" + (actual_row_init + size);
    emitter.emit('writeRow', time + '\t' + learners + '\n');
});