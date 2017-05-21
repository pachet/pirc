var
	isString         = req('/lib/utilities/is-string'),
	InvalidNickError = req('/lib/errors/invalid-nick'),
	ErrorReasons     = req('/lib/constants/error-reasons'),
	Regexes          = req('/lib/constants/regexes');

const
	MINIMUM_NICK_LENGTH = 1,
	MAXIMUM_NICK_LENGTH = 16;


function validate(nick) {

	if (!nick) {
		throw new InvalidNickError(nick, ErrorReasons.OMITTED);
	}

	if (!isString(nick)) {
		throw new InvalidNickError(nick, ErrorReasons.WRONG_TYPE);
	}

	if (nick.length < MINIMUM_NICK_LENGTH) {
		throw new InvalidNickError(nick, ErrorReasons.UNDER_MINIMUM_LENGTH);
	}

	if (nick.length > MAXIMUM_NICK_LENGTH) {
		throw new InvalidNickError(nick, ErrorReasons.OVER_MAXIMUM_LENGTH);
	}

	if (!Regexes.NICK.test(nick)) {
		throw new InvalidNickError(nick, ErrorReasons.INVALID_CHARACTERS);
	}

}

module.exports = {
	validate
};