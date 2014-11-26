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

describe("underscore", function() {
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
		return modulator.define(["underscore/underscore.js"], function(_) {
			expect(_).toNotEqual(null);
		});
	});

	it("should have a functioning 'filter' method", function() {
		return modulator.define(["underscore/underscore.js"], function(_) {
			var things = [1,2,3,4,5];
			var filtered = _.filter(things, function(thing) {
				return thing > 1;
			});

			expect(filtered.length).toBe(4);
		});
	});
});