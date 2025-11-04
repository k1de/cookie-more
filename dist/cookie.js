// Deserialization: SetCookieHeader/CookieHeader → CookieRecord/CookieObject
// Serialization: CookieRecord/CookieObject → CookieHeader
'use strict';
import * as vanillaCookie from 'cookie';
const delimiter = /; |;/;
const connector = '; ';
const cookiePropertyMap = {
    httponly: 'httpOnly',
    samesite: 'sameSite',
    'max-age': 'maxAge',
};
const cookie = {
    ...vanillaCookie,
    /**
     * Converts Cookie header string to parsed cookies object
     */
    cookieHeaderToCookieRecord: function (string = '') {
        return Object.assign({}, cookie.parse(string));
    },
    /**
     * Converts Set-Cookie headers array to parsed cookies object
     */
    setCookieHeadersToCookieRecord: function (setCookieHeaders = []) {
        return setCookieHeaders //
            .map((string) => cookie.cookieHeaderToCookieRecord(string.split(delimiter)[0]))
            .reduce((result, item) => ({ ...result, ...item }), {});
    },
    /**
     * Converts cookie objects array to parsed cookies object
     */
    cookieObjectsToCookieRecord: function (cookieObjects = []) {
        return Object.fromEntries(cookieObjects.map((obj) => [obj.name, obj.value]));
    },
    /**
     * Universal converter to parsed cookies object
     */
    anyToCookieRecord: function (data) {
        if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
            return data;
        }
        else if (typeof data === 'string') {
            return cookie.cookieHeaderToCookieRecord(data);
        }
        else if (Array.isArray(data)) {
            if (typeof data[0] === 'string') {
                return cookie.setCookieHeadersToCookieRecord(data);
            }
            else if (typeof data[0] === 'object' && data[0] !== null) {
                return cookie.cookieObjectsToCookieRecord(data);
            }
        }
        throw new Error('Unknown cookies format');
    },
    /**
     * Converts parsed cookies object to Cookie header string
     */
    cookieRecordToCookieHeader: function (cookieRecord = {}) {
        return Object.entries(cookieRecord)
            .map(([name, value]) => cookie.serialize(name, value))
            .join(connector);
    },
    /**
     * Universal converter to Cookie header string
     */
    anyToCookieHeader: function (data) {
        return cookie.cookieRecordToCookieHeader(cookie.anyToCookieRecord(data));
    },
    /**
     * Converts parsed cookies object to cookie objects array
     */
    cookieRecordToCookieObjects: function (cookieRecord = {}, attributes = {}) {
        return Object.entries(cookieRecord).map(([name, value]) => ({ name, value: value, ...attributes }));
    },
    /**
     * Universal converter to cookie objects array
     */
    anyToCookieObjects: function (data, attributes) {
        if (Array.isArray(data)) {
            if (typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0])) {
                // cookieObjects
                return data.map((object) => ({ ...object, ...attributes }));
            }
            else if (typeof data[0] === 'string') {
                // setCookieHeaders
                return cookie.setCookieHeadersToCookieObjects(data, attributes);
            }
            return [];
        }
        return cookie.cookieRecordToCookieObjects(cookie.anyToCookieRecord(data), attributes || {});
    },
    /**
     * Converts Set-Cookie headers array to cookie objects array
     * All property names are converted to lowercase
     */
    setCookieHeadersToCookieObjects: (array = [], attributes = {}) => {
        return array.map((string) => {
            const parts = string.split(/;\s*/);
            const [nameValue, ...flags] = parts;
            // Parse name=value
            const [name, value] = nameValue.split('=');
            const result = { name, value: value };
            // Parse flags and attributes
            flags.forEach((flag) => {
                const [key, val] = flag.split('=');
                const lowerKey = key.toLowerCase();
                const propName = cookiePropertyMap[lowerKey] || lowerKey;
                if (propName === 'maxAge') {
                    result.maxAge = parseInt(val);
                }
                else {
                    result[propName] = val === undefined ? true : val;
                }
            });
            return { ...result, ...attributes };
        });
    },
    /**
     * Converts cookie objects array to Set-Cookie headers array
     * Opposite of setCookieHeadersToCookieObjects
     */
    cookieObjectsToSetCookieHeaders: function (cookieObjects = [], attributes) {
        return cookieObjects.map((obj) => {
            const { name, value, ...rest } = { ...obj, ...attributes };
            const options = {};
            Object.entries(rest).forEach(([key, val]) => {
                if (val === undefined)
                    return;
                if (key === 'expires') {
                    options.expires = new Date(val);
                }
                else if (key === 'maxAge') {
                    options.maxAge = val;
                }
                else {
                    options[key] = val;
                }
            });
            return cookie.serialize(name, value, options);
        });
    },
    /**
     * Universal converter to Set-Cookie headers array
     */
    anyToSetCookieHeaders: function (data, attributes) {
        const cookieObjects = cookie.anyToCookieObjects(data, attributes);
        return cookie.cookieObjectsToSetCookieHeaders(cookieObjects);
    },
};
export default cookie;
