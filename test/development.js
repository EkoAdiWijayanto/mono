const test = require('ava')
const { join } = require('path')

const { start, stop, $get } = require('@terrajs/mono-test-utils')
const monoPath = join(__dirname, '..')

let ctx

test('Start the server and log whats happening', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/simple'), { monoPath })
	const stdout = ctx.stdout.join('\n')
	t.true(stdout.includes('Boot foo module'))
	t.true(stdout.includes('Init foo module'))
	t.true(stdout.includes('Init hello/hello.init.js'))
	t.true(stdout.includes('Init http.init.js'))
	t.true(stdout.includes('Adding routes from foo module'))
	t.true(stdout.includes('Adding routes from hello/hello.routes.js'))
	t.true(stdout.includes('Server running on'))
})

/*
** Informations routes
*/
test('GET /_ => @terrajs/mono', async (t) => {
	const { statusCode, body, stdout, stderr } = await $get('/_')
	t.is(statusCode, 200)
	t.is(body, '@terrajs/mono')
	t.is(stderr.length, 0)
	t.is(stdout.length, 1)
	t.true(stdout[0].includes('GET /_'))
})

test('GET /_ping => pong', async (t) => {
	const { statusCode, body, stdout, stderr } = await $get('/_ping')
	t.is(statusCode, 200)
	t.is(body, 'pong')
	t.is(stderr.length, 0)
	t.is(stdout.length, 1)
	t.true(stdout[0].includes('GET /_ping'))
})

test('GET /_routes => 200 with routes', async (t) => {
	const { statusCode, body } = await $get('/_routes')
	t.is(statusCode, 200)
	t.true(Array.isArray(body))
	t.true(body.length > 0)
})

test('GET /404 => 404 status code', async (t) => {
	const { statusCode, body } = await $get('/404')
	t.is(statusCode, 404)
	t.is(body.code, 'not-found')
	t.is(body.context.url, '/404')
})

test.after('Close the server', async (t) => {
	await stop(ctx.server)
})