"use strict";
// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair
/* eslint-disable perfectionist/sort-objects */
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingProperties = void 0;
exports.settingProperties = [
    {
        settingKey: 'application.csrfSecret',
        settingName: 'Application - CSRF Secret',
        description: 'The secret used for CSRF protection.',
        type: 'string',
        defaultValue: '',
        isUserConfigurable: false
    }
];
