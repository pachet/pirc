
var
	extend        = require('../../utility/extend'),
	Message_Reply = require('../../message/reply'),
	Enum_Replies  = require('../../enum/replies');


class Message_Reply_ChannelTopicDetails extends Message_Reply {

	getChannelName() {
		return this.channel_name;
	}

	setChannelName(channel_name) {
		this.channel_name = channel_name;
		return this;
	}

	getAuthorUserId() {
		return this.author_user_id;
	}

	setAuthorUserId(user_id) {
		this.author_user_id = user_id;
		return this;
	}

	getAuthorNickname() {
		return this.author_nickname;
	}

	setAuthorNickname(nickname) {
		this.author_nickname = nickname;
		return this;
	}

	getTimestamp() {
		return this.timestamp;
	}

	setTimestamp(timestamp) {
		this.timestamp = timestamp;
	}

	getValuesForParameters() {
		return {
			channel_name: this.getChannelName(),
			user_id:      this.getAuthorUserId(),
			nickname:     this.getAuthorNickname(),
			timestamp:    this.getTimestamp()
		};
	}

	setValuesFromParameters(parameters) {
		this.setChannelName(parameters.get('channel_name'));
		this.setAuthorUserId(parameters.get('user_id'));
		this.setAuthorNickname(parameters.get('nickname'));
		this.setTimestamp(parameters.get('timestamp'));
	}

}

extend(Message_Reply_ChannelTopicDetails.prototype, {
	reply:           Enum_Replies.RPL_TOPICWHOTIME,
	abnf:            '<channel-name> " " (<user-id> / <nickname>) " " <timestamp>',
	channel_name:    null,
	author_user_id:  null,
	author_nickname: null,
	timestamp:       null
});

module.exports = Message_Reply_ChannelTopicDetails;
