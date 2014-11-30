var q = require("q");
var vm = require("vm");

var slice = function(foo) {
	return Array.prototype.slice.call(foo);
};

module.exports = Modulator;

function Modulator(opts) {
	this.opts = opts = opts || {};
	this._cache = opts.cache === undefined ? true : opts.cache;
	this._plugins = opts.plugins || {};
	this.moduleCache = {};
}

Modulator.prototype.define = function(/* args */) {
	var self = this;
	var modName = null;
	var dependencyNames = null;
	var cb = null;
	var args = slice(arguments);

	// cb is required, and it's always the last argument
	cb = args.pop();

	if(args.length === 1) {
		dependencyNames = args[0];
	} else if(args.length === 2) {
		modName = args[0];
		dependencyNames = args[1];
	} else {
		throw new Error("invalid arguments");
	}

	var dependencies = dependencyNames.map(function(name) {
		var resolver = self.locateResolver(name);

		if (resolver === null) {
			throw new Error("no plugin registered for '" + name + "'");
		}

		var mod = null;
		var doCache = false;

		if (self._cache === true) {
			mod = self.cache(name);
		}

		if (mod == null) {
			var content = resolver(name, self.modularize.bind(self));
			mod = q(content);

			if (self._cache === true) {
				self.cache(name, mod);
			}
		}

		if (mod == null) {
			throw new Error("module not found: " + name);
		}

		return mod;
	});

	return q(dependencies).spread(function( /* args */ ) {
		return cb.apply(undefined, Array.prototype.slice.call(arguments));
	});
};

// make it look like an AMD loader
Modulator.prototype.define.amd = {};

Modulator.prototype.cache = function(name, module) {
	if (module === undefined) {
		return this.moduleCache[name];
	} else {
		this.moduleCache[name] = module.then ? module : q(module);
	}
};

Modulator.prototype.locateResolver = function(name) {
	var idx = name.indexOf(".");
	var id = idx === -1 ? name : name.substr(0, idx);
	var suffix = idx === -1 ? null : name.substr(idx);

	if (suffix === null) {
		return this._plugins["default"];
	} else {
		// maybe add support for cool suffix patterns/fragments/stuff here
		return this._plugins[suffix];
	}
};

Modulator.prototype.modularize = function(name, str) {
	var self = this;
	var result;
	var sandbox = {};
	sandbox.__filename = name;

	var localDefine = function() {
		result = self.define.apply(self, arguments);
	};

	localDefine.amd = Modulator.prototype.define.amd;
	sandbox.define = localDefine;

	// add execution timeout support
	vm.runInNewContext(str, sandbox, name);
	return result;
};