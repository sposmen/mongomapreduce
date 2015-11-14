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
    performance_cuantity = 0, performance_low = Infinity, performance_high = 0, performance_avg = 0,
    learners = 0;

var processRecord;
processRecord = function (data) {
    var line = data.split('\t'),
        value = JSON.parse(line[1]),
        session_length = parseInt(value.session_lenght) / 60;

    if (session_length < init) return;
    if (end != null && session_length > end) return;

    // Change row
    while (session_length >= actual_row_init + size) {
        var time = actual_row_init + "-" + (actual_row_init + size);
        var error_avg = (performance_high + performance_low ) / 2;

        emitter.emit('writeRow', time + '\t' +  learners + '\t'+ performance_avg + '\t' + (error_avg == Infinity ? 0 : error_avg) + '\n');
        actual_row_init = actual_row_init + size;
        performance_cuantity = 0;
        performance_low = Infinity;
        performance_high = 0;
        performance_avg = 0;
        learners = 0;
    }

    if (session_length < (actual_row_init + size) && session_length >= actual_row_init) {
        ++learners;
        performance_low = Math.min(performance_low, value.performance_avg);
        performance_high = Math.max(performance_high, value.performance_avg);
        performance_avg = ((performance_avg * performance_cuantity) + value.performance_avg) / (++performance_cuantity);
    }
};


emitter.on('writeRow', function (line) {
    process.stdout.write(line)
});

new Lazy(process.stdin).lines.forEach(function (row) {
    processRecord(row.toString());
}).on('pipe', function () {
    //Last Row
    var time = actual_row_init + "-" + (actual_row_init + size);
    var error_avg = (performance_high + performance_low ) / 2;
    emitter.emit('writeRow', time + '\t' + learners + '\t'+ performance_avg + '\t' + (error_avg == Infinity ? 0 : error_avg) + '\n');
});