var Promise = require("bluebird");
var vm = require("vm");

module.exports = Modulator;

function Modulator(opts) {
	this.opts = opts = opts || {};
	this._cache = opts.cache === undefined ? true : opts.cache;
	this._plugins = opts.plugins || {};
	this.moduleCache = {};
}

Modulator.prototype.define = function(dependencyNames, cb) {
	var self = this;

	var dependencies = dependencyNames.map(function(name) {
		var resolver = self.locateResolver(name);

		if (resolver === null) {
			throw new Error("no plugin registered for '" + name + "'");
		}

		var mod = null;
		var doCache = false;

		if (self._cache === true) {
			mod = self.moduleCache[name];
		}

		if (self._cache === true && mod == null) {
			doCache = true;
		}

		if(mod == null) {
			var content = resolver(name, self.modularize.bind(self));
			mod = Promise.resolve(content);

			if(doCache) {
				self.moduleCache[name] = mod;
			}
		}

		if (mod == null) {
			throw new Error("module not found: " + name);
		}

		return mod;
	});

	return Promise.resolve(dependencies).spread(function(/* args */) {
		return cb.apply(undefined, Array.prototype.slice.call(arguments));
	});
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
	var localDefine = this.define.bind(this);

	var sandbox = {};
	sandbox.define = localDefine;
	sandbox.__filename = name;

	// add execution timeout support
	var result = vm.runInNewContext(str, sandbox, name);
	return result;
};