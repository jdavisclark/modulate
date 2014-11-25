var Modulator = require("../lib/core");
var expect = require("expect");

function dummyProvider(name) {
	return "module:" + name;
}

describe("resolver location", function() {
	var modulator;

	beforeEach(function() {
		modulator = new Modulator({
			plugins: {
				"default": dummyProvider,
				".json": JSON.parse //wth...
			}
		});
	});

	it("should choose the default provider for simple modules", function() {
		var resolver = modulator.locateResolver("foo");
		expect(resolver).toBe(dummyProvider);
	});

	it("should choose the json provider for json modules", function() {
		var resolver = modulator.locateResolver("foo.json");
		expect(resolver).toBe(JSON.parse);
	});

	it("should return undefined for an unregistered module type", function() {
		var resolver = modulator.locateResolver("foo.html");
		expect(resolver).toBe(undefined);
	});

	it("should return the expected value for default modules", function() {
		var resolver = modulator.locateResolver("foo");
		var val = resolver("foo");
		expect(val).toBe("module:foo");
	});
});
