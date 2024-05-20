const { predictClassification } = require('../services/inferenceService');
const storeData = require('../services/storeData');
const crypto = require('crypto');
const { predictionHistory } = require('./history');

async function postPredictHandler(request, h) {
	const { image } = request.payload;
	const { model } = request.server.app;

	const id = crypto.randomUUID();
	const createdAt = new Date().toISOString();

	const data = {
		id: id,
		result: '',
		suggestion: '',
		createdAt: createdAt,
	};

	try {
		await storeData(id, data);
		predictionHistory.push(data);

		const { label, suggestion } = await predictClassification(model, image);

		data.result = label;
		data.suggestion = suggestion;

		await storeData(id, data);

		const response = h.response({
			status: 'success',
			message: 'Model predicted successfully',
			data,
		});
		response.code(201);
		return response;
	} catch (error) {
		return h
			.response({
				status: 'fail',
				message: `Terjadi kesalahan dalam melakukan prediksi`,
			})
			.code(400);
	}
}

const getPredictionHistoryHandler = () => {
	const responseData = predictionHistory.map((item) => ({
		id: item.id,
		history: {
			result: item.result,
			createdAt: item.createdAt,
			suggestion: item.suggestion,
			id: item.id,
		},
	}));

	return {
		status: 'success',
		data: responseData,
	};
};

module.exports = { postPredictHandler, getPredictionHistoryHandler };
