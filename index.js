'use strict';

var EXPORTS = createEventCenter;

// set immediate polyfill
require("setimmediate");


function empty() {
}

function createEventCenter() {
    var first = null,
        last = null,
        E = empty,
        Base = BaseEventBus;
        
    var Prototype;
    
    // attach subscription
    function attach(subscription) {
        var lastSubscriber = last;
        
        subscription.next = null;
        last = subscription;
        
        // append
        if (lastSubscriber) {
            lastSubscriber.next = subscription;
            subscription.previous = lastSubscriber;
        }
        // create
        else {
            first = subscription;
            subscription.previous = null;
        }
        
        return subscription;
    }
    
    // remove subscription
    function remove(subscription) {
        var previous = subscription.previous,
            next = subscription.next,
            running = subscription.running;
            
        if (last === subscription) {
            last = previous;
        }
        if (first === subscription) {
            first = next;
        }
        if (previous) {
            previous.next = next;
        }
        if (next) {
            next.previous = previous;
        }
        delete subscription.active;
        delete subscription.previous;
        delete subscription.next;
        // remove running queue
        for (; running; ) {
            next = running[0];
            clearImmediate(running[1]);
            running[0] = null;
            running[1] = null;
            running = next;
        }
        return next;
    }
    
    function summaryRemove() {
        var current = last,
            removeSubscription = remove;
        var next;

        for (; current; ) {
            if (current.active) {
                current = current.previous;
            }
            else {
                next = current.previous;
                removeSubscription(current);
                current = next;
            }
        }
        
    }
    
    function EventBus() {
        var instance = this;
            
        if (instance instanceof EventBus) {
            Base.apply(instance, arguments);
            return instance;
        }
        else {
            return createEventCenter();
        }
    }
    
    E.prototype = Base.prototype;
    EventBus.prototype = Prototype = new E();
    
    Prototype.subscribe = function (name, callback, scope) {
        var bus = this;
        
        // subscription
        function subscription(args) {
            var me = subscription;
            
            me.running = [
                me.running,
                setImmediate(function () {
                    var me = subscription;
                    
                    me.running = me.running[0];
                    
                    if (me.active) {
                        callback.apply(scope, args);
                    }
                    else {
                        remove(me);
                    }
                    me = null;
                })];
        }
        
        // stopper will only mark subscription as not active
        function stop() {
            var me = subscription;
            if (me.running) {
                delete me.active;
            }
            else {
                remove(me);
            }
            return bus;
        }
        
        
        if (!name || typeof name !== 'string') {
            throw new Error('[name] parameter is not valid');
        }
        else if (!(callback instanceof Function)) {
            throw new Error('[callback] parameter must be Function');
        }
        
        subscription.running = null;
        subscription.active = true;
        subscription.topic = name;
        
        attach(subscription);
        
        return stop;
    };
    
    Prototype.publish = function (name) {
        var A = Array.prototype,
            args = {},
            current = first;
        
        // remove inactive handlers only if not publishing
        summaryRemove();
           
        A.push.apply(args, A.slice.call(arguments, 1));
        
        // execute active handlers
        for (; current; current = current.next) {
            if (name === current.topic) {
                current(args);
            }
        }
        
        return this;
    };
    
    Prototype.purge = function () {
        var current = last;
        
        // mark inactive
        for (; current; current = current.previous) {
            delete current.active;
        }
        
        summaryRemove();
        return this;
    };
    
    return new EventBus();
    
}






function BaseEventBus() {
}

BaseEventBus.prototype = {
    constructor: BaseEventBus
};


module.exports = EXPORTS;
