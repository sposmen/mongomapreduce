#!/usr/bin/env node
var Lazy = require('lazy'),
    events = require('events'),
    emitter = new events.EventEmitter();



var validateJson = function (jsonData) {
    try {
        return JSON.parse(jsonData);
    } catch (_error) {
        return false;
    }
};

var processRecord = function (row) {
    var key, value, line, session = row.session;

    if(row.events.length > 0) {
        var low, high;

        for (var i = 0; i < row.events.length; ++i) {
            var event = row.events[i];
            if (typeof(event.timestamp) == 'undefined') continue;
            low = typeof event.timestamp != 'undefined' ? (!!low ? Math.min(low, event.timestamp) : event.timestamp) : null;
            high = typeof event.timestamp != 'undefined' ? (!!high ? Math.max(high, event.timestamp) : event.timestamp) : 0;
        }
        high = !!high ? high : 0;
        low = !!low ? low : high;
        if(high == 0 || low == 0) return;
        var session_lenght;
        session_lenght = Math.round((high/1000) - (low/1000));
        key = completeToLength(session_lenght, 10) + session.session_id;
        value = session_lenght;
        line = key + '\t' + value +'\n';
        emitter.emit('writeRow', line);
    }


};

emitter.on('writeRow', function (line) { process.stdout.write(line) });

new Lazy(process.stdin).lines.filter(function (row) {
    return !!validateJson(row);
}).forEach(function (row) {
    processRecord(JSON.parse(row.toString()));
});

/**
 * Generates a string length of a specific character
 * @param char Character to repeat
 * @param times How many times
 * @returns {string}
 */
String.prototype.repeat= function(n){
    n= n || 1;
    return Array(n+1).join(this);
}
/**
 * Completes a string to specified length with the specified char
 * @param str
 * @param length
 * @param char
 * @param toRight
 * @returns {string}
 */
var completeToLength = function (str, length, char) {
    char = char || "0";
    return char.repeat(length - str.toString().length) + str;
};