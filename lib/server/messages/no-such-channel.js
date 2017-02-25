
var
	extend        = req('/utilities/extend'),
	ServerMessage = req('/lib/server/message'),
	ReplyNumerics = req('/constants/reply-numerics'),
	ErrorReasons  = req('/constants/error-reasons');

var
	InvalidChannelNameError = req('/lib/errors/invalid-channel-name');


class ServerNoSuchChannelMessage extends ServerMessage {

	serializeParams() {
		var
			targets         = this.serializeTargets(),
			channel_details = this.getChannelDetails(),
			channel_name    = channel_details.getName(),
			body            = this.getBody();

		return `${targets} ${channel_name} :${body}`;
	}

	applyParsedParams(middle_params, trailing_param) {
		this.addTargetFromString(middle_params.shift());

		this.getChannelDetails().setName(middle_params.shift());
		this.setBody(trailing_param);
	}

	getChannelName() {
		return this.getChannelDetails().getName();
	}

	toError() {
		return new InvalidChannelNameError(
			this.getChannelName(),
			ErrorReasons.NOT_FOUND
		);
	}

}

extend(ServerNoSuchChannelMessage.prototype, {
	reply_numeric: ReplyNumerics.ERR_NOSUCHCHANNEL,
	body:          'No such channel'
});

module.exports = ServerNoSuchChannelMessage;