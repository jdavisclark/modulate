var expect = require("expect");
var Modulator = require("../lib/core");

describe("modularization", function() {
	var modulator = null;
	var modularize = null;

	beforeEach(function() {
		modulator = new Modulator();
		modularize = modulator.modularize.bind(modulator);
	});

	// basically just a wrapper over vm.runInNewContext at this point...
	it("should return the correct simple string", function() {
		var result = modularize("dummy", "'foo';");
		expect(result).toBe("foo");
	});

	//TODO: timeout/supervisor test
});