#! /usr/bin/env node
'use strict';

var fs = require('fs'),
    spawn = require('child_process').exec;

fs.readFile('./ny.json', 'utf8', parse);

function parse(err, data) {
    if(err) {
        return console.error(err);
    }

    data = JSON.parse(data);
    handle(data);
}

function handle(data) {
    var i, arg;
    for(i = 2; i < process.argv.length; i++) {
        arg = process.argv[i];
        if(data[arg].length) {
            run(data[arg]);
        }
    }
}

function run(script) {
    var i;
    for(i = 0; i < script.length; i++) {
        spawn(script[i], function(err, out, code) {
            if(err) {
                console.error(err);
            }
            console.log('running', i);
            process.stdout.write(out);
        });
    }
}