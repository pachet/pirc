
var has = require('./has');

function add(value) {
	function to(array) {
		if (!has(array, value)) {
			array.push(value);
			return true;
		} else {
			return false;
		}
	}

	return { to };
}

module.exports = add;
