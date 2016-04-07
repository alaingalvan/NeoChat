"use strict";
var store = {
    users: new Array(),
    count: 0,
    channels: {
        '#anouncements': {
            type: 'mod',
            messages: new Array()
        },
        '#soccer': {
            type: 'mod',
            messages: new Array()
        },
        '#jazz': {
            type: 'mod',
            messages: new Array()
        },
        '#admin': {
            type: 'sysop',
            messages: new Array()
        },
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = store;
;
//# sourceMappingURL=chat-session.js.map