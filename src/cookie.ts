// Deserialization: SetCookieHeader/CookieHeader → CookieRecord/CookieObject
// Serialization: CookieRecord/CookieObject → CookieHeader

'use strict'

import * as vanillaCookie from 'cookie'

/**
 * Cookie header string (request)
 * @example "session=abc123; id=42"
 */
export type CookieHeader = string

/**
 * Set-Cookie header string (response, serialized)
 * @example "session=abc123; Path=/; HttpOnly; Secure"
 */
export type SetCookieHeader = string

/**
 * Cookie object with metadata (deserialized, Puppeteer-compatible)
 * @example { name: "session", value: "abc123", path: "/", httpOnly: true }
 */
export interface CookieObject {
    name: string
    value: string
    domain?: string
    path?: string
    expires?: string | number
    maxAge?: number
    httpOnly?: boolean
    secure?: boolean
    sameSite?: 'Strict' | 'Lax' | 'None' | string
    [key: string]: unknown
}

/**
 * Parsed cookies object (deserialized)
 * @example { session: "abc123", id: "42" }
 */
export interface CookieRecord {
    [name: string]: string
}

/**
 * Additional cookie attributes
 * @example { domain: "example.com", secure: true }
 */
export interface CookieAttributes {
    [key: string]: unknown
}

/**
 * Union type for all supported cookie input formats
 */
export type CookieInput = CookieHeader | SetCookieHeader[] | CookieRecord | CookieObject[]

const delimiter = /; |;/
const connector = '; '
const cookiePropertyMap: Record<string, string> = {
    httponly: 'httpOnly',
    samesite: 'sameSite',
    'max-age': 'maxAge',
}

const cookie = {
    ...vanillaCookie,
    /**
     * Converts Cookie header string to parsed cookies object
     */
    cookieHeaderToCookieRecord: function (string: CookieHeader = ''): CookieRecord {
        return Object.assign({}, cookie.parse(string)) as CookieRecord
    },

    /**
     * Converts Set-Cookie headers array to parsed cookies object
     */
    setCookieHeadersToCookieRecord: function (setCookieHeaders: SetCookieHeader[] = []): CookieRecord {
        return setCookieHeaders //
            .map((string) => cookie.cookieHeaderToCookieRecord(string.split(delimiter)[0]))
            .reduce((result, item) => ({ ...result, ...item }), {})
    },

    /**
     * Converts cookie objects array to parsed cookies object
     */
    cookieObjectsToCookieRecord: function (cookieObjects: CookieObject[] = []): CookieRecord {
        return Object.fromEntries(cookieObjects.map((obj) => [obj.name, obj.value]))
    },
    /**
     * Universal converter to parsed cookies object
     */
    anyToCookieRecord: function (data: CookieInput): CookieRecord {
        if (typeof data === 'object' && !Array.isArray(data) && data !== null) {
            return data as CookieRecord
        } else if (typeof data === 'string') {
            return cookie.cookieHeaderToCookieRecord(data as CookieHeader)
        } else if (Array.isArray(data)) {
            if (typeof data[0] === 'string') {
                return cookie.setCookieHeadersToCookieRecord(data as SetCookieHeader[])
            } else if (typeof data[0] === 'object' && data[0] !== null) {
                return cookie.cookieObjectsToCookieRecord(data as CookieObject[])
            }
        }

        throw new Error('Unknown cookies format')
    },

    /**
     * Converts parsed cookies object to Cookie header string
     */
    cookieRecordToCookieHeader: function (cookieRecord: CookieRecord = {}): CookieHeader {
        return Object.entries(cookieRecord)
            .map(([name, value]) => cookie.serialize(name, value))
            .join(connector)
    },

    /**
     * Universal converter to Cookie header string
     */
    anyToCookieHeader: function (data: CookieInput): CookieHeader {
        return cookie.cookieRecordToCookieHeader(cookie.anyToCookieRecord(data))
    },

    /**
     * Converts parsed cookies object to cookie objects array
     */
    cookieRecordToCookieObjects: function (cookieRecord: CookieRecord = {}, attributes: CookieAttributes = {}): CookieObject[] {
        return Object.entries(cookieRecord).map(([name, value]) => ({ name, value: value, ...attributes }))
    },

    /**
     * Universal converter to cookie objects array
     */
    anyToCookieObjects: function (data: CookieInput, attributes?: CookieAttributes): CookieObject[] {
        if (Array.isArray(data)) {
            if (typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0])) {
                // cookieObjects
                return (data as CookieObject[]).map((object: CookieObject) => ({ ...object, ...attributes }))
            } else if (typeof data[0] === 'string') {
                // setCookieHeaders
                return cookie.setCookieHeadersToCookieObjects(data as SetCookieHeader[], attributes)
            }
            return []
        }
        return cookie.cookieRecordToCookieObjects(cookie.anyToCookieRecord(data), attributes || {})
    },

    /**
     * Converts Set-Cookie headers array to cookie objects array
     * All property names are converted to lowercase
     */
    setCookieHeadersToCookieObjects: (array: SetCookieHeader[] = [], attributes: CookieAttributes = {}): CookieObject[] => {
        return array.map((string: SetCookieHeader) => {
            const parts = string.split(/;\s*/)
            const [nameValue, ...flags] = parts

            // Parse name=value
            const [name, value] = nameValue.split('=')
            const result: CookieObject = { name, value: value as string }

            // Parse flags and attributes
            flags.forEach((flag) => {
                const [key, val] = flag.split('=')
                const lowerKey = key.toLowerCase()
                const propName = cookiePropertyMap[lowerKey] || lowerKey

                if (propName === 'maxAge') {
                    result.maxAge = parseInt(val)
                } else {
                    result[propName] = val === undefined ? true : val
                }
            })

            return { ...result, ...attributes }
        })
    },

    /**
     * Converts cookie objects array to Set-Cookie headers array
     * Opposite of setCookieHeadersToCookieObjects
     */
    cookieObjectsToSetCookieHeaders: function (cookieObjects: CookieObject[] = [], attributes?: CookieAttributes): SetCookieHeader[] {
        return cookieObjects.map((obj) => {
            const { name, value, ...rest } = { ...obj, ...attributes }
            const options: vanillaCookie.SerializeOptions = {}

            Object.entries(rest).forEach(([key, val]) => {
                if (val === undefined) return

                if (key === 'expires') {
                    options.expires = new Date(val as string | number)
                } else if (key === 'maxAge') {
                    options.maxAge = val as number
                } else {
                    (options as any)[key] = val
                }
            })

            return cookie.serialize(name, value, options)
        })
    },

    /**
     * Universal converter to Set-Cookie headers array
     */
    anyToSetCookieHeaders: function (data: CookieInput, attributes?: CookieAttributes): SetCookieHeader[] {
        const cookieObjects = cookie.anyToCookieObjects(data, attributes)
        return cookie.cookieObjectsToSetCookieHeaders(cookieObjects)
    },
}

export default cookie
