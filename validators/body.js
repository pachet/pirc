var
	InvalidBodyError = req('/lib/errors/invalid-body'),
	ErrorReasons     = req('/constants/error-reasons'),
	isString         = req('/utilities/is-string');


function validate(body) {
	if (!body) {
		throw new InvalidBodyError(body, ErrorReasons.OMITTED);
	}

	if (!isString(body)) {
		throw new InvalidBodyError(body, ErrorReasons.WRONG_TYPE);
	}
}


module.exports = {
	validate
};