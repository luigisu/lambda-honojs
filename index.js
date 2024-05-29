const { Hono } = require('hono');
const { handle } = require('hono/aws-lambda');

const app = new Hono();

app.get('/', (c) => c.text('Hello Hono!'));

exports.handler = handle(app);
