var
	toArray    = require('./to-array'),
	isFunction = require('./is-function');

function defer() {
	var
		args     = toArray(arguments),
		callback = args.shift();

	if (!isFunction(callback)) {
		throw new Error('Must supply a valid callback');
	}

	setTimeout(function deferred() {
		callback.apply(this, args);
	}, 0);
}

module.exports = defer;
