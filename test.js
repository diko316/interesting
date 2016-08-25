'use strict';


var BUS = require('./index.js')();
var bad;


BUS.subscribe('good', function() {
    console.log('okies1');
});


BUS.subscribe('good', function() {
    console.log('okies2');
});


BUS.subscribe('good', function() {
    console.log('okies3');
});


bad = BUS.subscribe('good', function() {
    console.log('bad!');
    //interesting();
    //bad();
    BUS.purge();
});


BUS.publish('good', {name: 'buang'});

console.log('next');

BUS.publish('good', {name: 'buang1'});

BUS.publish('good', {name: 'buang1'});
