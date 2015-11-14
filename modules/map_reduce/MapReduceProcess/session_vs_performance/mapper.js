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
        var session_low = Infinity, session_high = 0,
            performance_cuantity = 0, performance_low = Infinity, performance_high = 0, performance_avg = 0;

        for (var i = 0, length = row.events.length; i < length; ++i) {
            var event = row.events[i];
            if (typeof(event.timestamp) == 'undefined') continue;
            session_low = Math.min(session_low, event.timestamp);
            session_high = Math.max(session_high, event.timestamp);
            //Generate power data
            if(['design_tested', 'materials_tested'].indexOf(event.event) != -1 &&
                typeof(event.data['homespowered']) != 'undefined' &&
                !isNaN(event.data['homespowered']) &&
                event.data['homespowered'] != ''
                ){
                var housepower = parseFloat(event.data['homespowered']);
                performance_low = Math.min(performance_low, housepower);
                performance_high = Math.max(performance_high,housepower);
                performance_avg = ((performance_avg*performance_cuantity) + housepower) / (++performance_cuantity);
            }
        }

        if (session_high == session_low || session_low == Infinity || performance_avg == 0) return;
        var session_lenght;
        session_lenght = Math.round((session_high / 1000) - (session_low / 1000));
        key = completeToLength(session_lenght, 10) + session.session_id;
        value = JSON.stringify({
            session_lenght: session_lenght,
            performance_avg: performance_avg,
            performance_error: (performance_high + performance_low ) / 2
        });
        line = key + '\t' + value + '\n';
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