'use strict';

var BaseBus = require('./bus.js');

function empty() {
}

function emptyCallback() {
}

function createEventCenter() {
    
    var hasOwn = Object.prototype.hasOwnProperty,
        subscribers = {},
        counters = {},
        Base = BaseBus;
    var Proto;
    
    function registerSubscriber(name, callback, scope) {
        var list = subscribers,
            gen = counters;
        var id, callbacks;
        
        // stopper
        function stop() {
            var list = callbacks;
            if (list) {
                list[id] = null;
                delete list[id];
                callbacks = null;
                list = null;
                runner = null;
            }
        }
        
        // runner
        function runner() {
            callback.apply(scope, arguments);
        }
        
        if (!hasOwn.call(list, name)) {
            list[name] = {};
            gen[name] = 0;
        }
        
        callbacks = list[name];
        id = ++gen[name];
        
        callbacks[id] = runner;
        gen = null;
        
        return stop;
    }
    
    function Bus() {
        Base.apply(this, arguments);
    }
    
    empty.prototype = Base.prototype;
    Bus.prototype = Proto = new empty();
    
    Proto.constructor = Bus;
    
    Proto.subscribe = function (name, callback, scope) {
                        if (name && typeof name === 'string' &&
                            callback instanceof Function) {
                            
                            return registerSubscriber(name, callback,
                                                typeof scope === 'undefined' ?
                                                    null : scope
                                            );
                        }
                        return emptyCallback;
                    };
                    
    Proto.publish = function (name) {
                        var list = subscribers,
                            A = Array.prototype;
                        var id, callbacks, args;
                        
                        if (hasOwn.call(list, name)) {
                            callbacks = list[name];
                            args = {};
                            
                            A.push.apply(args, A.slice.call(arguments, 1));
                            
                            for (id in callbacks) {
                                if (callbacks.hasOwnProperty(id)) {
                                    try {
                                        callbacks[id].apply(null, args);
                                    }
                                    catch (e) {}
                                }
                            }
                            args = null;
                            callbacks = null;
                        }
                        list = null;
                        return this;
                    };
    
    Proto.purge = function () {
                        var list = subscribers,
                            h = hasOwn;
                        var name, id, callbacks;
                        
                        for (name in list) {
                            if (h.call(list, name)) {
                                callbacks = list[name];
                                for (id in callbacks) {
                                    if (callbacks.hasOwnProperty(id)) {
                                        delete callbacks[id];
                                    }
                                }
                            }
                        }
                        callbacks = null;
                        list = null;
                        return this;
                    };
    
    return new Bus();
    
}



module.exports = createEventCenter;
