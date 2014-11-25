module.exports = function(name, modularize) {
	return modularize(name, "define([], function(){return 'module:"+name+"' })");
};