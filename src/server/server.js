require('dotenv').config();

const Hapi = require('@hapi/hapi');
const routes = require('../server/routes');
const loadModel = require('../services/loadModel');
const InputError = require('../exceptions/inputError');

(async () => {
	const server = Hapi.server({
		port: 3000,
		routes: {
			cors: {
				origin: ['*'],
			},
		},
	});

	const model = await loadModel();
	server.app.model = model;

	server.route(routes);

	server.ext('onPreResponse', function (request, h) {
		const response = request.response;

		if (response instanceof InputError || response.isBoom) {
			const status = 'fail';
			const message =
				response instanceof InputError
					? `${response.message} Silakan gunakan foto lain.`
					: response.message;
			const code =
				response instanceof InputError
					? response.statusCode
					: response.output.statusCode;

			return h
				.response({
					status,
					message,
				})
				.code(code);
		}

		return h.response(response.source).code(response.statusCode);
	});

	await server.start();
	console.log(`Server started at: ${server.info.uri}`);
})();
