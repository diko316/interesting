'use strict';

var EXPORTS = createEventCenter,
    EE = require('eventemitter3'),
    EVENTS = new EE();

function empty() {
}

function createEventCenter() {
    var first = null,
        last = null,
        E = empty,
        Base = BaseEventBus,
        publishing = false;
        
    var Prototype;
    
    // attach subscription
    function attach(subscription) {
        var lastSubscriber = last;
        
        subscription.next = null;
        subscription.previous = lastSubscriber;

        // append
        if (lastSubscriber) {
            lastSubscriber.next = subscription;
        }
        // create
        else {
            first = subscription;
        }
        
        last = subscription;
        
        
        return subscription;
    }
    
    // remove subscription
    function remove(subscription) {
        var next = subscription.next;
        var previous;
        
        if (subscription.subscribed) {
            previous = subscription.previous;
            
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
            delete subscription.topic;
            delete subscription.isRegExp;
            delete subscription.active;
            delete subscription.subscribed;
            delete subscription.previous;
            delete subscription.next;
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
        var bus = this,
            isRegExp = name instanceof RegExp;
        
        // subscription
        function subscription(args) {
            var event = EVENTS,
                me = subscription;
            
            if (me.active) {
                event.once('call', callback, scope);
                event.emit.apply(event, args);
            }
            else if (!publishing && me.subscribed) {
                remove(me);
            }
            
        }
        
        // stopper will only mark subscription as not active
        function stop() {
            var me = subscription;
            if (publishing) {
                delete me.active;
            }
            else if (me.subscribed) {
                remove(me);
            }
            return bus;
        }
        
        
        if (!name || (typeof name !== 'string' && !isRegExp)) {
            throw new Error('[name] parameter is not valid');
        }
        else if (!(callback instanceof Function)) {
            throw new Error('[callback] parameter must be Function');
        }
        
        subscription.active = true;
        subscription.topic = name;
        subscription.isRegExp = isRegExp;
        subscription.subscribed = true;
        
        attach(subscription);
        
        return stop;
    };
    
    Prototype.publish = function (name) {
        var A = Array.prototype,
            args = { 0:'call', length: 1 },
            current = first,
            oldPublishing = publishing;
        var topic;
        publishing = true;
        
        A.push.apply(args, A.slice.call(arguments, 1));
        
        // execute active handlers
        for (; current; current = current.next) {
            topic = current.topic;
            if (current.isRegExp ? topic.test(name) : name === topic) {
                current(args);
            }
        }
        
        publishing = oldPublishing;
        
        // remove inactive handlers only if not publishing
        summaryRemove();
        
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
