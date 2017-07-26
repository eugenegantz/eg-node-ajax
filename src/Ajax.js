/**
 * @module eg-node-ajax
 * */
const
	voidFn          = () => {},
	Ajax            = Object.create(null),
	modIconvLite    = require('iconv-lite'),
	modURL          = require('url'),
	modHttp         = require('http'),
	modHttps        = require('https'),
	lodash          = require('lodash'),
	jqParams        = require('eg-jquery-params');

/**
 * @callback AjaxReqCallback
 * @param {String | null} err - ошибка
 * @param {Object} context - ответ запроса
 * @param {Error} context.error - ошибка
 * @param {Number} context.errno - номер ошибки
 * @param {String} context.responseText - содержимое ответа
 * @param {Number} context.status - код-статус ответа от сервера
 * */

/**
 * @param {Object} arg
 * @param {String} arg.url,
 * @param {AjaxReqCallback} arg.callback
 * @param {String} arg.method
 * @param {Object} arg.vars
 * @param {String} arg.data
 * */
Ajax.request = function(arg = {}) {
	var reqData,
		URLParsed       = modURL.parse(arg.url),
		method          = typeof arg.method !== 'string' ? 'GET' : arg.method.toUpperCase(),
		callback        = typeof arg.callback !== 'function' ? voidFn : arg.callback,
		decodeFrom      = typeof arg.decodeFrom !== 'string' ? null : arg.decodeFrom,
		http            = /^https:/ig.test(arg.url) ? modHttps : modHttp,
		argVars         = !arg.vars ? {} : arg.vars,
		argData         = !arg.data ? null : arg.data;

	// ---------------------------------------------------------------
	// Аргументы

	if (typeof arg.url !== 'string' || !arg.url)
		throw new Error('!arg.url');

	if (!argData) {
		reqData = typeof argVars === 'object' ? jqParams(argVars) : '';

	} else {
		reqData = typeof argData === 'string' ? argData : '';
	}

	if (!URLParsed.port)
		URLParsed.port = 80;

	// ---------------------------------------------------------------
	// Параметры запроса

	var httpReqOpt = {
		hostname: URLParsed.hostname,
		port: URLParsed.port,
		path: method === 'GET'
			? lodash.trim(URLParsed.path, '?') + '?' + reqData
			: URLParsed.path,
		method: method,
		headers: {
			'Content-length': reqData.length,
			'Content-type': 'application/x-www-form-urlencoded',
			'Connection': 'keep-alive',
			'Accept-Encoding': 'gzip, deflate',
			'User-Agent': 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.89 Safari/537.36'
		}
	};

	// ---------------------------------------------------------------

	var req = http.request(httpReqOpt, function(res) {
		var httpReqParts = [];

		res.on('data', chunk => httpReqParts.push(chunk));

		res.on('end', () => {
			// httpReqParts.push(chunk);
			callback(
				null,
				{
					error: null,
					responseText: (
						!decodeFrom
							? httpReqParts.join('')
							: modIconvLite.decode(Buffer.concat(httpReqParts), decodeFrom)
					),
					status: res.statusCode,
					headers: res.headers
				}
			);
		});
	});

	req.on('error', e => {
		console.log('problem with request: ' + e.message);
		callback(
			e.message,
			{
				error: e.message,
				errno: e.errno,
				responseText: null,
				status: null,
				headers: null
			}
		);
	});

	req.write(reqData);
	req.end();
};


Ajax.req = Ajax.request;


module.exports = Ajax;