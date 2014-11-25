var fs = require("fs");

module.exports = function(name, modularize) {
	return JSON.parse(fs.readFileSync(name));
}