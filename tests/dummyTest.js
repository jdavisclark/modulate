var expect = require("expect");
var Modulator = require("../lib/core");
var dummyProvider = require("./fixtures/dummyModuleProvider");
var jsonProvider = require("./fixtures/jsonModuleProvider");
var Promise = require("bluebird");

var path = require("path");

describe("things", function() {
	var modulator = null;

	beforeEach(function() {
		modulator = new Modulator({
			cache: false,
			plugins: {
				"default": dummyProvider,
				".json" : jsonProvider
			}
		});
	});

	it("should probably work", function() {
		return new Promise(function(resolve, reject) {
			var p = path.join(__dirname, "./fixtures/test.json");

			return modulator.define(["myModuleName", p], function(mymodule, obj) {
				expect(mymodule).toBe("module:myModuleName");
				expect(obj).toEqual({hurr:"durr"});
			}).then(resolve,reject);
		});
	});
});