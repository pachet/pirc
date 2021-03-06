
var
	extend        = require('../../utility/extend'),
	Message_Reply = require('../../message/reply'),
	Enum_Replies  = require('../../enum/replies');

class Message_Reply_LocalUsers extends Message_Reply {

	getUserCount() {
		return this.user_count;
	}

	setUserCount(user_count) {
		this.user_count = user_count;
		return this;
	}

	getMaxUserCount() {
		return this.max_user_count;
	}

	setMaxUserCount(user_count) {
		this.max_user_count = user_count;
		return this;
	}

	getValuesForParameters() {
		return {
			user_count: [
				this.getUserCount(),
				this.getMaxUserCount(),
				this.getUserCount(),
				this.getMaxUserCount()
			]
		};
	}

	setValuesFromParameters(parameters) {
		this.setUserCount(parameters.getNext('user_count'));
		this.setMaxUserCount(parameters.getNext('user_count'));
	}

}

extend(Message_Reply_LocalUsers.prototype, {

	reply:          Enum_Replies.RPL_LOCALUSERS,
	abnf:           '<user-count> " " <user-count> " :Current local users " <user-count> ", max " <user-count>',
	user_count:     null,
	max_user_count: null

});

module.exports = Message_Reply_LocalUsers;
