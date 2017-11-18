'use strict';

var Ajax = require("./../src/Ajax.js"),
	modHttp = require('http');

describe("Ajax-module", function() {
	var srv,
		port = 9999,
		host = "127.0.0.1",
		protocol = "http:";

	before(function() {
		srv = modHttp.createServer();

		srv.listen(port);

		srv.on("request", (req, res) => {
			var data = [];

			req.on("data", function(buf) {
				data.push(buf);

			}).on("end", function() {
				data = req.method.toUpperCase() === "GET"
					? decodeURIComponent(req.url).replace("/?", "")
					: decodeURIComponent(Buffer.concat(data).toString());

				// method=test:async&argument[]=100&argument[]=200&argument[]=abc

				res.end(data);
			})
		});
	});

	after(function(done) {
		srv.unref();
		srv.close(function(err) {
			if (err)
				return done(err);

			done();
		});
	});

	describe("Ajax.req", function() {
		// TODO "Ajax.req"

		it("Ответ без ошибок", function(done) {
			Ajax.request({
				"url": protocol + "//" + host + ":" + port,
				"method": "GET",
				"vars": {
					"a": 100,
					"b": {
						"ba": 210,
						"bb": 220
					},
					"c": [1, 2, 3]
				},
				"callback": function(err, res) {
					if (err)
						return done(err);

					done();
				}
			});
		});
	});

	describe("Ajax.req / vars / POST", function() {
		it("Ответ не содержит ошибок; содержание ответа совпадает с эталонной строкой", function(done) {
			Ajax.request({
				"url": protocol + "//" + host + ":" + port,
				"method": "POST",
				"vars": {
					"method": "test:async",
					argument: [100, 200, "abc"]
				},
				"callback": function(err, res) {
					var exp = "method=test:async&argument[]=100&argument[]=200&argument[]=abc";

					if (err)
						return done(err);

					if (res.responseText !== exp)
						return done("expected: " + exp + "; received: " + res.responseText);

					done();
				}
			});
		});
	});

	describe("Ajax.req / vars / GET", function() {
		// TODO "Ajax.req"

		it("Ответ не содержит ошибок; содержание ответа совпадает с эталонной строкой", function(done) {
			Ajax.request({
				"url": protocol + "//" + host + ":" + port,
				"method": "GET",
				"vars": {
					"method": "test:async",
					argument: [100, 200, "abc"]
				},
				"callback": function(err, res) {
					var exp = "method=test:async&argument[]=100&argument[]=200&argument[]=abc";

					if (err)
						return done(err);

					if (res.responseText !== exp)
						return done("expected: " + exp + "; received: " + res.responseText);

					done();
				}
			});
		});
	});

});