
var
	_add    = req('/lib/utilities/add'),
	_remove = req('/lib/utilities/remove'),
	extend  = req('/lib/utilities/extend');


class CallbackList {

	add(callback) {
		_add(callback).to(this.getCallbacks());
	}

	remove(callback) {
		_remove(callback).from(this.getCallbacks());
	}

	getCallbacks() {
		if (!this.callbacks) {
			this.callbacks = [ ];
		}

		return this.callbacks;
	}

}

extend(CallbackList.prototype, {
	callbacks: null
});

module.exports = CallbackList;