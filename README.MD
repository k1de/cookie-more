# cookie-more

🔧 **Utility that extends the standard `cookie` module with additional conversion capabilities.**

## Installation

```bash
npm install cookie-more
```

## Usage

```javascript
import cookie from 'cookie-more'
```

## Cookie Types

The module works with 4 cookie formats:

-   **`CookieHeader`** - Cookie header string (request)  
    `"session=abc123; id=42"`

-   **`SetCookieHeader`** - Set-Cookie header string (response, serialized)  
    `"session=abc123; Path=/; HttpOnly; Secure"`

-   **`CookieRecord`** - Parsed cookies object (deserialized)  
    `{ session: "abc123", id: "42" }`

-   **`CookieObject`** - Cookie object with metadata (deserialized, Puppeteer-compatible)  
    `{ name: "session", value: "abc123", path: "/", httpOnly: true }`

## API Functions

### Conversions to CookieRecord

-   `cookieHeaderToCookieRecord(string)` - Parse Cookie header
-   `setCookieHeadersToCookieRecord(array)` - Parse Set-Cookie headers array
-   `cookieObjectsToCookieRecord(array)` - Convert cookie objects array
-   `anyToCookieRecord(data)` - Universal converter

### Conversions to CookieHeader

-   `cookieRecordToCookieHeader(object)` - Serialize to Cookie header
-   `anyToCookieHeader(data)` - Universal converter

### Conversions to CookieObject[]

-   `cookieRecordToCookieObjects(object, attributes?)` - Add metadata
-   `setCookieHeadersToCookieObjects(array, attributes?)` - Parse with metadata (Puppeteer-compatible)
-   `anyToCookieObjects(data, attributes?)` - Universal converter

### Conversions to SetCookieHeader[]

-   `cookieObjectsToSetCookieHeaders(array, attributes?)` - Serialize with metadata
-   `anyToSetCookieHeaders(data, attributes?)` - Universal converter

## Examples

```javascript
// Parse from request
cookie.anyToCookieRecord('session=abc; id=42')
// { session: 'abc', id: '42' }

// Set response cookies
cookie.anyToSetCookieHeaders({ session: 'abc', user: 'john' }, { path: '/', httpOnly: true, secure: true })

// Puppeteer to headers
cookie.anyToSetCookieHeaders(await page.cookies())

// Override attributes (priority)
cookie.anyToSetCookieHeaders([{ name: 'session', value: 'abc', path: '/' }], { path: '/api', secure: true })
// ['session=abc; Path=/api; Secure']
```

## Features

-   Convert cookies between all formats (CookieHeader ↔ SetCookieHeader[] ↔ CookieRecord ↔ CookieObject[])
-   Bidirectional parsing and serialization
-   Attribute override support (priority for passed attributes)
-   Simplified parsing and serialization
-   **Puppeteer-compatible** cookie object format (`httpOnly`, `sameSite`, etc.)
-   TypeScript support

🚀 **Just import and use it like the regular `cookie` module with extended API!**
