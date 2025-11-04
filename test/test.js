import { strict as assert } from 'assert'
import cookie from '../dist/cookie.js'

// ANSI colors
const colors = {
    green: (text) => `\x1b[32m${text}\x1b[0m`,
    red: (text) => `\x1b[31m${text}\x1b[0m`,
    gray: (text) => `\x1b[90m${text}\x1b[0m`,
    bold: (text) => `\x1b[1m${text}\x1b[0m`,
}

// Test data
const cookieHeader = 'session=abc123; id=42'
const setCookieHeaders = [
    'session=abc123; Path=/; Expires=Wed, 03 Jun 2023 12:00:00 GMT',
    'id=42; Path=/; Secure; Domain=example.com',
    'theme=dark; Path=/; HttpOnly; SameSite=Strict',
]
const cookieRecord = { session: 'abc123', id: '42', theme: 'dark' }
const cookieObjects = [
    { name: 'session', value: 'abc123', path: '/' },
    { name: 'id', value: '42', path: '/' },
    { name: 'theme', value: 'dark', path: '/' },
]
const cookieObjectsWithAttrs = [
    { name: 'session', value: 'abc123', path: '/', httpOnly: true },
    { name: 'id', value: '42', path: '/', secure: true },
]
const cookieObjectFull = {
    name: 'test',
    value: 'value',
    path: '/api',
    domain: 'example.com',
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 3600,
}
const cookieObjectForOverride = { name: 'session', value: 'abc', path: '/', httpOnly: true }
const complexCookieObjects = [
    {
        name: 'session',
        value: 'abc123',
        path: '/api',
        domain: 'example.com',
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        maxAge: 3600,
    },
    {
        name: 'user',
        value: 'john',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
    },
]
const complexSetCookieHeaders = [
    'token=xyz789; Path=/admin; Domain=test.com; Max-Age=7200; HttpOnly; Secure; SameSite=Strict',
    'theme=dark; Path=/; Secure; SameSite=None',
    'session=abc456; Path=/api; Expires=Wed, 21 Oct 2025 07:28:00 GMT; HttpOnly',
]

// Test runner
let passed = 0
let failed = 0

function test(name, fn) {
    try {
        fn()
        console.log(`${colors.green('✓')} ${colors.gray(name)}`)
        passed++
    } catch (err) {
        console.log(`${colors.red('✗')} ${name}`)
        console.error(`  ${colors.red(err.message)}`)
        failed++
    }
}

function group(name) {
    console.log(`\n${colors.bold(name)}`)
}

// Tests
group('CookieRecord conversions')

test('cookieHeaderToCookieRecord', () => {
    const result = cookie.cookieHeaderToCookieRecord(cookieHeader)
    assert.equal(result.session, 'abc123')
    assert.equal(result.id, '42')
})

test('setCookieHeadersToCookieRecord', () => {
    const result = cookie.setCookieHeadersToCookieRecord(setCookieHeaders)
    assert.equal(result.session, 'abc123')
    assert.equal(result.id, '42')
    assert.equal(result.theme, 'dark')
})

test('cookieObjectsToCookieRecord', () => {
    const result = cookie.cookieObjectsToCookieRecord(cookieObjects)
    assert.deepEqual(result, cookieRecord)
})

test('anyToCookieRecord from CookieHeader', () => {
    const result = cookie.anyToCookieRecord(cookieHeader)
    assert.equal(result.session, 'abc123')
})

test('anyToCookieRecord from SetCookieHeaders', () => {
    const result = cookie.anyToCookieRecord(setCookieHeaders)
    assert.equal(result.session, 'abc123')
})

test('anyToCookieRecord from CookieObjects', () => {
    const result = cookie.anyToCookieRecord(cookieObjects)
    assert.deepEqual(result, cookieRecord)
})

test('anyToCookieRecord from CookieRecord', () => {
    const result = cookie.anyToCookieRecord(cookieRecord)
    assert.deepEqual(result, cookieRecord)
})

group('CookieHeader conversions')

test('cookieRecordToCookieHeader', () => {
    const result = cookie.cookieRecordToCookieHeader(cookieRecord)
    assert.ok(result.includes('session=abc123'))
    assert.ok(result.includes('id=42'))
})

test('anyToCookieHeader from CookieRecord', () => {
    const result = cookie.anyToCookieHeader(cookieRecord)
    assert.ok(result.includes('session=abc123'))
})

test('anyToCookieHeader from SetCookieHeaders', () => {
    const result = cookie.anyToCookieHeader(setCookieHeaders)
    assert.ok(result.includes('session=abc123'))
})

test('anyToCookieHeader from CookieObjects', () => {
    const result = cookie.anyToCookieHeader(cookieObjects)
    assert.ok(result.includes('session=abc123'))
})

group('CookieObject conversions')

test('cookieRecordToCookieObjects', () => {
    const result = cookie.cookieRecordToCookieObjects(cookieRecord)
    assert.equal(result[0].name, 'session')
    assert.equal(result[0].value, 'abc123')
})

test('cookieRecordToCookieObjects with attributes', () => {
    const result = cookie.cookieRecordToCookieObjects(cookieRecord, { secure: true })
    assert.equal(result[0].secure, true)
})

test('setCookieHeadersToCookieObjects', () => {
    const result = cookie.setCookieHeadersToCookieObjects(setCookieHeaders)
    assert.equal(result[0].name, 'session')
    assert.equal(result[0].path, '/')
    assert.ok(result[0].expires)
})

test('setCookieHeadersToCookieObjects preserves all attributes', () => {
    const result = cookie.setCookieHeadersToCookieObjects(setCookieHeaders)
    assert.ok(result[1].secure)
    assert.equal(result[1].domain, 'example.com')
    assert.ok(result[2].httpOnly)
    assert.equal(result[2].sameSite, 'Strict')
})

test('anyToCookieObjects from CookieHeader', () => {
    const result = cookie.anyToCookieObjects(cookieHeader)
    assert.equal(result[0].name, 'session')
})

test('anyToCookieObjects from SetCookieHeaders with attributes', () => {
    const result = cookie.anyToCookieObjects(setCookieHeaders, { custom: 'value' })
    assert.equal(result[0].custom, 'value')
})

test('anyToCookieObjects from CookieObjects merges attributes', () => {
    const result = cookie.anyToCookieObjects(cookieObjects, { secure: true })
    assert.equal(result[0].secure, true)
})

group('Vanilla cookie module methods')

test('parse method is available', () => {
    const result = cookie.parse(cookieHeader)
    assert.equal(result.session, 'abc123')
})

test('serialize method is available', () => {
    const result = cookie.serialize('session', 'abc123')
    assert.equal(result, 'session=abc123')
})

group('SetCookieHeader conversions')

test('cookieObjectsToSetCookieHeaders basic', () => {
    const result = cookie.cookieObjectsToSetCookieHeaders(cookieObjectsWithAttrs)
    assert.ok(result[0].includes('session=abc123'))
    assert.ok(result[0].includes('Path=/'))
    assert.ok(result[0].includes('HttpOnly'))
    assert.ok(result[1].includes('id=42'))
    assert.ok(result[1].includes('Secure'))
})

test('cookieObjectsToSetCookieHeaders with all attributes', () => {
    const result = cookie.cookieObjectsToSetCookieHeaders([cookieObjectFull])
    assert.ok(result[0].includes('test=value'))
    assert.ok(result[0].includes('Path=/api'))
    assert.ok(result[0].includes('Domain=example.com'))
    assert.ok(result[0].includes('HttpOnly'))
    assert.ok(result[0].includes('Secure'))
    assert.ok(result[0].includes('SameSite=Strict'))
    assert.ok(result[0].includes('Max-Age=3600'))
})

test('cookieObjectsToSetCookieHeaders attributes override', () => {
    const result = cookie.cookieObjectsToSetCookieHeaders([cookieObjectForOverride], {
        path: '/api',
        secure: true,
        domain: 'example.com',
    })
    assert.ok(result[0].includes('session=abc'))
    assert.ok(result[0].includes('Path=/api'))
    assert.ok(result[0].includes('Domain=example.com'))
    assert.ok(result[0].includes('Secure'))
    assert.ok(result[0].includes('HttpOnly'))
})

test('anyToSetCookieHeaders from CookieRecord', () => {
    const result = cookie.anyToSetCookieHeaders(cookieRecord, {
        path: '/',
        httpOnly: true,
    })
    assert.equal(result.length, 3)
    assert.ok(result[0].includes('session=abc123'))
    assert.ok(result[0].includes('Path=/'))
    assert.ok(result[0].includes('HttpOnly'))
})

test('anyToSetCookieHeaders from CookieHeader', () => {
    const result = cookie.anyToSetCookieHeaders(cookieHeader, {
        secure: true,
        sameSite: 'Lax',
    })
    assert.equal(result.length, 2)
    assert.ok(result[0].includes('Secure'))
    assert.ok(result[0].includes('SameSite=Lax'))
})

test('anyToSetCookieHeaders from CookieObjects', () => {
    const result = cookie.anyToSetCookieHeaders(cookieObjects, {
        domain: 'test.com',
    })
    assert.equal(result.length, 3)
    assert.ok(result[0].includes('Path=/'))
    assert.ok(result[0].includes('Domain=test.com'))
})

test('anyToSetCookieHeaders from SetCookieHeaders (roundtrip)', () => {
    const result = cookie.anyToSetCookieHeaders(setCookieHeaders)
    assert.equal(result.length, 3)
    assert.ok(result[0].includes('session=abc123'))
    assert.ok(result[1].includes('id=42'))
    assert.ok(result[2].includes('theme=dark'))
})

group('Roundtrip conversions')

test('CookieObject[] → SetCookieHeader[] → CookieObject[] with complex data', () => {
    const headers = cookie.cookieObjectsToSetCookieHeaders(complexCookieObjects)
    const objects = cookie.setCookieHeadersToCookieObjects(headers)

    assert.equal(objects.length, 2)
    assert.equal(objects[0].name, 'session')
    assert.equal(objects[0].value, 'abc123')
    assert.equal(objects[0].path, '/api')
    assert.equal(objects[0].domain, 'example.com')
    assert.equal(objects[0].httpOnly, true)
    assert.equal(objects[0].secure, true)
    assert.equal(objects[0].sameSite, 'Strict')
    assert.equal(objects[0].maxAge, 3600)

    assert.equal(objects[1].name, 'user')
    assert.equal(objects[1].value, 'john')
    assert.equal(objects[1].path, '/')
    assert.equal(objects[1].httpOnly, true)
    assert.equal(objects[1].sameSite, 'Lax')
})

test('SetCookieHeader[] → CookieObject[] → SetCookieHeader[] with complex data', () => {
    const objects = cookie.setCookieHeadersToCookieObjects(complexSetCookieHeaders)
    const headers = cookie.cookieObjectsToSetCookieHeaders(objects)

    assert.equal(headers.length, 3)
    assert.ok(headers[0].includes('token=xyz789'))
    assert.ok(headers[0].includes('Path=/admin'))
    assert.ok(headers[0].includes('Domain=test.com'))
    assert.ok(headers[0].includes('Max-Age=7200'))
    assert.ok(headers[0].includes('HttpOnly'))
    assert.ok(headers[0].includes('Secure'))
    assert.ok(headers[0].includes('SameSite=Strict'))

    assert.ok(headers[1].includes('theme=dark'))
    assert.ok(headers[1].includes('Path=/'))
    assert.ok(headers[1].includes('Secure'))
    assert.ok(headers[1].includes('SameSite=None'))

    assert.ok(headers[2].includes('session=abc456'))
    assert.ok(headers[2].includes('Path=/api'))
    assert.ok(headers[2].includes('Expires='))
    assert.ok(headers[2].includes('HttpOnly'))
})

test('Full roundtrip: CookieObject[] → SetCookieHeader[] → CookieObject[] → SetCookieHeader[]', () => {
    const headers1 = cookie.cookieObjectsToSetCookieHeaders(complexCookieObjects)
    const objects = cookie.setCookieHeadersToCookieObjects(headers1)
    const headers2 = cookie.cookieObjectsToSetCookieHeaders(objects)

    assert.equal(headers1.length, headers2.length)
    assert.deepEqual(headers1, headers2)
})

// Summary
console.log(`\n${'='.repeat(40)}`)
const total = passed + failed
const passedText = passed > 0 ? colors.green(`Passed: ${passed}`) : `Passed: ${passed}`
const failedText = failed > 0 ? colors.red(`Failed: ${failed}`) : `Failed: ${failed}`
console.log(`Total: ${total} | ${passedText} | ${failedText}`)
process.exit(failed > 0 ? 1 : 0)
