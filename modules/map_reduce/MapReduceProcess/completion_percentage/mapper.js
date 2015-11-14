#!/usr/bin/env node
'use strict';


process.on("uncaughtException", function (err) {
    console.error((new Date()).toUTCString() + " uncaughtException: " + err.message);
    console.error(err.stack);
//    process.exit(1);
});

var Lazy = require('lazy'),
    events = require('events'),
    argv = require('minimist')(process.argv.slice(2)),
    widgets = ((typeof argv.widgets != 'undefined') && argv.widgets.toString().trim() != '') ? argv.widgets.toString().split(',') : false,
    emitter = new events.EventEmitter();

var processRecord;
processRecord = function (row) {
    var key, value, line, session = row.session;

    if((!!widgets && widgets.indexOf(session.widget_id)!=-1) || !widgets) {

        if (row.events.length > 0) {
            var ended = false;

            for (var i = 0, events_length = row.events.length; i < events_length; ++i) {
                // Finish if the end events are present
                var event = row.events[i];
                if (typeof(event.timestamp) == 'undefined') continue;
                if (typeof(event.event) == 'undefined') continue;
                if (event.event == 'panel_changed' && event.data.current == "review") {
                    // Add to current
                    ended = true;
                    break;
                }
            }

            // Not Finished
            key = session.widget_id + "|" + session.session_id;
            value = ended ? 1 : 0;
            line = key + '\t' + value + '\n';
            emitter.emit('writeRow', line);
        }
    }


};

emitter.on('writeRow', function (line) { process.stdout.write(line) });

var validateJson;
validateJson = function (jsonData) {
    try {
        return JSON.parse(jsonData);
    } catch (_error) {
        return false;
    }
};

new Lazy(process.stdin).lines.filter(function (row) {
    return !!validateJson(row);
}).forEach(function (row) {
    processRecord(JSON.parse(row.toString()));
});