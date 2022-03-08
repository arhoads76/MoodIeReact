import * as axios from 'axios/dist/axios.js';

export function _get(url, options, cancelSourceCallback) {
	if (typeof options == 'function') {
		cancelSourceCallback = options;
		options = {};
	} else if (!options) {
		options = {};
	}

	if (cancelSourceCallback)
		options = {...options, ...prepareCancelOptions(cancelSourceCallback) };

	return axios.get(url, options).then(_normalizeResponse)
}
export function _post(url, data, options, cancelSourceCallback) {
	if (typeof options == 'function') {
		cancelSourceCallback = options;
		options = {};
	} else if (!options) {
		options = {};
	}

	if (cancelSourceCallback)
		options = {...options, ...prepareCancelOptions(cancelSourceCallback) };

	return axios.post(url, data, options).then(_normalizeResponse);
}
export function _delete(url, options, cancelSourceCallback) {
	if (typeof options == 'function') {
		cancelSourceCallback = options;
		options = {};
	} else if (!options) {
		options = {};
	}

	if (cancelSourceCallback)
		options = {...options, ...prepareCancelOptions(cancelSourceCallback) };

	return axios.delete(url, options).then(_normalizeResponse);
}
export function _send(options) {
	return axios(options);
}
export function _normalizeResponse(resp) {
	return resp.data;
}

function prepareCancelOptions(cancelSourceCallback) {
	var source = axios.CancelToken.source();
	cancelSourceCallback(source);
	return { cancelToken:source.token };
}
