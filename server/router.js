const { app, staticServer } = require('http-server');

const { rootPath } = require('./listi');

app.use(staticServer(rootPath('dist')));

app.use((req, res, next) => {
	next(res.reqType === 'file' ? { code: 404, detail: `Could not find ${req.originalUrl}` } : null);
});
