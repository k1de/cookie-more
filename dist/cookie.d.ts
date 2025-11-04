import * as vanillaCookie from 'cookie';
/**
 * Cookie header string (request)
 * @example "session=abc123; id=42"
 */
export type CookieHeader = string;
/**
 * Set-Cookie header string (response, serialized)
 * @example "session=abc123; Path=/; HttpOnly; Secure"
 */
export type SetCookieHeader = string;
/**
 * Cookie object with metadata (deserialized, Puppeteer-compatible)
 * @example { name: "session", value: "abc123", path: "/", httpOnly: true }
 */
export interface CookieObject {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: string | number;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None' | string;
    [key: string]: unknown;
}
/**
 * Parsed cookies object (deserialized)
 * @example { session: "abc123", id: "42" }
 */
export interface CookieRecord {
    [name: string]: string;
}
/**
 * Additional cookie attributes
 * @example { domain: "example.com", secure: true }
 */
export interface CookieAttributes {
    [key: string]: unknown;
}
/**
 * Union type for all supported cookie input formats
 */
export type CookieInput = CookieHeader | SetCookieHeader[] | CookieRecord | CookieObject[];
declare const cookie: {
    /**
     * Converts Cookie header string to parsed cookies object
     */
    cookieHeaderToCookieRecord: (string?: CookieHeader) => CookieRecord;
    /**
     * Converts Set-Cookie headers array to parsed cookies object
     */
    setCookieHeadersToCookieRecord: (setCookieHeaders?: SetCookieHeader[]) => CookieRecord;
    /**
     * Converts cookie objects array to parsed cookies object
     */
    cookieObjectsToCookieRecord: (cookieObjects?: CookieObject[]) => CookieRecord;
    /**
     * Universal converter to parsed cookies object
     */
    anyToCookieRecord: (data: CookieInput) => CookieRecord;
    /**
     * Converts parsed cookies object to Cookie header string
     */
    cookieRecordToCookieHeader: (cookieRecord?: CookieRecord) => CookieHeader;
    /**
     * Universal converter to Cookie header string
     */
    anyToCookieHeader: (data: CookieInput) => CookieHeader;
    /**
     * Converts parsed cookies object to cookie objects array
     */
    cookieRecordToCookieObjects: (cookieRecord?: CookieRecord, attributes?: CookieAttributes) => CookieObject[];
    /**
     * Universal converter to cookie objects array
     */
    anyToCookieObjects: (data: CookieInput, attributes?: CookieAttributes) => CookieObject[];
    /**
     * Converts Set-Cookie headers array to cookie objects array
     * All property names are converted to lowercase
     */
    setCookieHeadersToCookieObjects: (array?: SetCookieHeader[], attributes?: CookieAttributes) => CookieObject[];
    /**
     * Converts cookie objects array to Set-Cookie headers array
     * Opposite of setCookieHeadersToCookieObjects
     */
    cookieObjectsToSetCookieHeaders: (cookieObjects?: CookieObject[], attributes?: CookieAttributes) => SetCookieHeader[];
    /**
     * Universal converter to Set-Cookie headers array
     */
    anyToSetCookieHeaders: (data: CookieInput, attributes?: CookieAttributes) => SetCookieHeader[];
    default: typeof import("cookie");
    parse(str: string, options?: vanillaCookie.ParseOptions): Record<string, string | undefined>;
    serialize(name: string, val: string, options?: vanillaCookie.SerializeOptions): string;
};
export default cookie;
