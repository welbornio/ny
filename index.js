#! /usr/bin/env node
'use strict';

var fs = require('fs'),
    colors = require('colors/safe'),
    spawn = require('child_process').spawn,
    data = null,
    reserved = [
        'init'
    ];

fs.readFile('./ny.json', 'utf8', parse);

/**
 * Parse ny.json file
 * @param err
 * @param file
 * @returns {*}
 */
function parse(err, file) {
    if(err) {
        return console.error(err);
    }
    data = JSON.parse(file);
    checkReserved();
    handle(process.argv.splice(2));
}

function checkReserved() {
    var fail = false,
        i;
    for(i = 0; i < reserved.length; i++) {
        if(data[reserved[i]]) {
            console.error(colors.red(reserved[i] + ' is a reserved ny script. Please rename your ' +
            'script.'));
            fail = true;
        }
    }

    if(fail) {
        process.exit(1);
    }
}

/**
 * Handle ny scripts
 * @param arr Array of ny script names
 */
function handle(arr) {
    var i, arg;
    for(i = 0; i < arr.length; i++) {
        arg = arr[i];
        if(!isReserved(arg)) {
            if(data[arg] && data[arg].length) {
                if(arg.charAt(0) === '~') {
                    runSync(data[arg], 0);
                }
                else {
                    runAsync(data[arg]);
                }
            }
            else {
                console.error(colors.red('The "' + arg + '" script does not exist'));
            }
        }
    }
}

/**
 * Check if the command is a reserved script, and if it is, run the internal script
 * @param arg
 * @returns {boolean} If arg is reserved
 */
function isReserved(arg) {
    if(reserved.indexOf(arg) === -1) {
        return false;
    }

    switch(arg) {
        case 'init':
            nyInit();
    }
    return true;
}

/**
 * Run a script asynchronously
 * @param script
 */
function runAsync(script) {
    var i, cmd, child;
    for(i = 0; i < script.length; i++) {
        cmd = script[i].split(' ');
        if(checkCmd(cmd[0])) {
            child = spawn(cmd[0], cmd.splice(1));
            child.stdout.pipe(process.stdout);
            child.stderr.pipe(process.stderr);
        }
    }
}

/**
 * Run a script synchronously
 * @param script Array that contains the script commands
 * @param idx Index of the command we are executing next
 */
function runSync(script, idx) {
    if(idx >= script.length) {
        return;
    }
    var cmd = script[idx].split(' ');
    var child;
    if(checkCmd(cmd[0])) {
        child = spawn(cmd[0], cmd.splice(1));
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        child.stdout.on('end', function() {
            runSync(script, idx + 1);
        });
    }
}

/**
 * Check if this command is another script name, or a command.
 * @param cmd
 * @returns {boolean} Return true if command, false if script name
 */
function checkCmd(cmd) {
    if(cmd.charAt(0) === '-' && cmd.charAt(1) === '-') {
        handle(Array(cmd.slice(2)));
        return false;
    }
    return true;
}

/**
 * Internal ny init script
 */
function nyInit() {

}