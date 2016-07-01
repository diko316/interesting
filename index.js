'use strict';

var EXPORTS = createEventCenter;

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
            next = subscription.next;
            
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
        delete subscription.previous;
        delete subscription.next;
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
            try {
                callback.apply(scope, args);
            }
            catch (e) {
                throw e;
            }
        }
        
        // stopper will only mark subscription as not active
        function stop() {
            if (publishing) {
                delete subscription.active;
            }
            else {
                remove(subscription);
            }
            return bus;
        }
        
        
        if (!name || typeof name !== 'string') {
            throw new Error('[name] parameter is not valid');
        }
        else if (!(callback instanceof Function)) {
            throw new Error('[callback] parameter must be Function');
        }
        
        subscription.active = true;
        subscription.topic = name;
        attach(subscription);
        
        return stop;
    };
    
    Prototype.publish = function (name) {
        var A = Array.prototype,
            args = {},
            current = first,
            oldPublishFlag = publishing;
           
        A.push.apply(args, A.slice.call(arguments, 1));
        
        // execute active handlers
        publishing = true;
        for (; current; current = current.next) {
            
            if (current.active && name === current.topic) {
                current(args);
            }

        }
        publishing = oldPublishFlag;
        
        // remove handlers only if not publishing
        if (!oldPublishFlag) {
            summaryRemove();
        }
        return this;
    };
    
    Prototype.purge = function () {
        var current = last;
        
        // mark inactive
        for (; current; current = current.previous) {
            delete current.active;
        }
        
        if (!publishing) {
            summaryRemove();
        }
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
