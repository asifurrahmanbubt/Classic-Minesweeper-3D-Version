/*global define */
define(function () {
    "use strict";
    const EventListener = function EventListener(object) {
        const handlers = {};

        object.on = function (event, handler) {
            if (!handlers[event]) {
                handlers[event] = [];
            }
            handlers[event].push(handler);

            return object;
        };

        object.trigger = function trigger(event, data) {
            if (!handlers[event]) {
//                console.warn('Event [' + event + '] not handled');
                return object;
            }
            handlers[event].forEach(function (handler) {
                if (typeof handler === 'function') {
                    handler(data);
                }
            });

            return object;
        };
    };

    EventListener.subscribe = function subscribe(object) {
        return new EventListener(object);
    };

    return EventListener;
});