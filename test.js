'use strict';


var interest = require('./index.js')();
var stopKiat1, stopKiat2;

stopKiat1 = interest.subscribe('kiat', function () {
                                        console.log('1. kiat! ', arguments);
                                    });

stopKiat2 = interest.subscribe('kiat', function () {
                                        console.log('2. kiat! ', arguments);
                                        console.log('this? ', this);
                                    }, { name: 'diko' });

interest.subscribe('kiat', function () {
                                        console.log('3. kiat! ', arguments);
                                    });


interest.publish('kiat', 'diko', 'buang');

stopKiat2();
console.log("2nd handler removed, it should not execute on next publish");



console.log('*** calling after 5 seconds');
setTimeout(
    function () {
        interest.publish('kiat', 'diko', 'buang', ' after 2 seconds');
       
        
        console.log('*** calling after 1 second');
        setTimeout(
            function () {
console.log('it should not call any handlers');
                interest.publish('kiat', 'diko', 'buang', ' after 1 second');
                
            }, 1000);
        
        interest.purge();
        
    }, 2000);



