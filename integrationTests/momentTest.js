var expect = require("expect");
var Modulator = require("../lib/core");
var path = require("path");
var fs = require("fs");

function weirdResolver(name, modularize) {
	var modulePath = path.join(__dirname, "bower_components", name);
	var text = fs.readFileSync(modulePath, "utf8");
	var modularized = modularize(name, text);

	return modularized;
}

describe("moment.js", function() {
	var modulator = null;

	beforeEach(function() {
		modulator = new Modulator({
			cache: false,
			plugins: {
				".js": weirdResolver
			}
		});
	});

	it("should load", function() {
		return modulator.define(["moment/moment.js"], function(moment) {
			expect(moment).toNotEqual(null);
		});
	});

	it("should have basic functionality", function() {
		return modulator.define(["moment/moment.js"], function(moment) {
			var d = moment("1995-12", "YYYY-MM");
			expect(d.year()).toEqual(1995);
			expect(d.month()).toEqual(11);
		});
	});
});