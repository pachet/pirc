/**
 * From RFC1459:
 *
 * ##########################################################################
 *
 * 4.2.1 Join message
 *
 *       Command: JOIN
 *    Parameters: <channel>{,<channel>} [<key>{,<key>}]
 *
 *    The JOIN command is used by client to start listening a specific
 *    channel. Whether or not a client is allowed to join a channel is
 *    checked only by the server the client is connected to; all other
 *    servers automatically add the user to the channel when it is received
 *    from other servers.  The conditions which affect this are as follows:
 *
 *            1.  the user must be invited if the channel is invite-only;
 *
 *            2.  the user's nick/username/hostname must not match any
 *                active bans;
 *
 *            3.  the correct key (password) must be given if it is set.
 *
 *    These are discussed in more detail under the MODE command (see
 *    section 4.2.3 for more details).
 *
 *    Once a user has joined a channel, they receive notice about all
 *    commands their server receives which affect the channel.  This
 *    includes MODE, KICK, PART, QUIT and of course PRIVMSG/NOTICE.  The
 *    JOIN command needs to be broadcast to all servers so that each server
 *    knows where to find the users who are on the channel.  This allows
 *    optimal delivery of PRIVMSG/NOTICE messages to the channel.
 *
 *    If a JOIN is successful, the user is then sent the channel's topic
 *    (using RPL_TOPIC) and the list of users who are on the channel (using
 *    RPL_NAMREPLY), which must include the user joining.
 *
 *    Numeric Replies:
 *
 *            ERR_NEEDMOREPARAMS              ERR_BANNEDFROMCHAN
 *            ERR_INVITEONLYCHAN              ERR_BADCHANNELKEY
 *            ERR_CHANNELISFULL               ERR_BADCHANMASK
 *            ERR_NOSUCHCHANNEL               ERR_TOOMANYCHANNELS
 *            RPL_TOPIC
 *
 *    Examples:
 *
 *    JOIN #foobar                    ; join channel #foobar.
 *
 *    JOIN &foo fubar                 ; join channel &foo using key "fubar".
 *
 *    JOIN #foo,&bar fubar            ; join channel #foo using key "fubar"
 *                                    and &bar using no key.
 *
 *    JOIN #foo,#bar fubar,foobar     ; join channel #foo using key "fubar".
 *                                    and channel #bar using key "foobar".
 *
 *    JOIN #foo,#bar                  ; join channels #foo and #bar.
 *
 *    :WiZ JOIN #Twilight_zone        ; JOIN message from WiZ
 *
 * ##########################################################################
 *
 */

var
	Heket           = require('heket'),
	extend          = require('../../utility/extend'),
	add             = require('../../utility/add'),
	Message_Command = require('../command'),
	Enum_Commands   = require('../../enum/commands'),
	Enum_Replies    = require('../../enum/replies');

var
	Message_Reply_NeedMoreParameters = require('../reply/need-more-parameters');


class Message_Command_Join extends Message_Command {

	getChannelName() {
		return this.getChannelNames()[0];
	}

	getChannelNames() {
		if (!this.channel_names) {
			this.channel_names = [ ];
		}

		return this.channel_names;
	}

	addChannelName(channel_name) {
		add(channel_name).to(this.getChannelNames());
		return this;
	}

	setChannelNames(channel_names) {
		this.channel_names = channel_names;
	}

	setChannelKey(channel_name, channel_key) {
		var keys = this.getChannelKeys();

		keys[channel_name] = channel_key;

		return this;
	}

	setChannelKeys(channel_names, channel_keys) {
		var index = 0;

		// Note: We count up to the number of channel keys;
		// not the number of channel names. There could be
		// more channel names supplied than channel keys,
		// in which case we should just ignore them.
		while (index < channel_keys.length) {
			let
				channel_name = channel_names[index],
				channel_key  = channel_keys[index];

			this.setChannelKey(channel_name, channel_key);
			index++;
		}
	}

	getChannelKeys() {
		var
			channel_targets = this.getChannelTargets(),
			result          = { };

		channel_targets.forEach(function each(channel_target) {
			if (channel_target.hasKey()) {
				result[channel_target.getName()] = channel_target.getKey();
			}
		});

		return result;
	}

	hasChannelKeys() {
		var keys = this.getChannelKeys();

		return Object.keys(keys).length > 0;
	}

	hasKeyForChannelName(channel_name) {
		return this.getKeyForChannelName(channel_name) !== null;
	}

	getKeyForChannelName(channel_name) {
		return this.getChannelKeys()[channel_name] || null;
	}

	getChannelKeys() {
		if (!this.channel_keys) {
			this.channel_keys = { };
		}

		return this.channel_keys;
	}

	sortTwoChannelNames(a, b) {
		var
			key_a = this.getKeyForChannelName(a),
			key_b = this.getKeyForChannelName(b);

		if (!key_a && !key_b) {
			return 0;
		}

		if (key_a && key_b) {
			return 0;
		}

		if (key_a && !key_b) {
			return -1;
		}

		if (!key_a && key_b) {
			return 1;
		}

		throw new Error(`
			How did we get here?
		`);
	}

	getSortedChannelNames() {
		return this.getChannelNames().sort(this.sortTwoChannelNames, this);
	}

	getSortedChannelKeys() {
		var
			channel_names = this.getSortedChannelNames(),
			channel_keys  = [ ];

		channel_names.forEach(function each(name) {
			var key = this.getKeyForChannelName(name);

			if (key) {
				channel_keys.push(key);
			}
		}, this);

		return channel_keys;
	}

	getValuesForParameters() {
		return {
			channel_name: this.getSortedChannelNames(),
			channel_key:  this.getSortedChannelKeys()
		};
	}

	setValuesFromParameters(parameters) {
		var
			channel_names = parameters.getAll('channel_name'),
			channel_keys  = parameters.getAll('channel_key');

		this.setChannelNames(channel_names);
		this.setChannelKeys(
			channel_names.slice(0, channel_keys.length),
			channel_keys
		);
	}

	getPossibleReplies() {
		return [
			Enum_Replies.ERR_NEEDMOREPARAMS,
			Enum_Replies.ERR_BANNEDFROMCHAN,
			Enum_Replies.ERR_INVITEONLYCHAN,
			Enum_Replies.ERR_BADCHANNELKEY,
			Enum_Replies.ERR_CHANNELISFULL,
			Enum_Replies.ERR_BADCHANMASK,
			Enum_Replies.ERR_NOSUCHCHANNEL,
			Enum_Replies.ERR_TOOMANYCHANNELS,
			Enum_Replies.RPL_TOPIC
		];
	}

	/**
	 * Override the parent class's matchesIncomingCommandMessage() method.
	 * The server will produce a matching JOIN response to our request to
	 * join the specified channel. We don't want this response to trigger
	 * any callback attached to this message. Instead, we want to wait for
	 * the end of the list of channel names.
	 *
	 * @returns {boolean}
	 */
	matchesIncomingCommandMessage() {
		return false;
	}

	matchesIncomingReplyMessage(message) {
		var reply = message.getReply();

		if (reply === Enum_Replies.RPL_TOPIC) {
			return false;
		}

		if (reply === Enum_Replies.RPL_ENDOFNAMES) {
			return this.matchesIncomingReplyMessageParameters(message);
		}

		return super.matchesIncomingReplyMessage(message);
	}

	handleParameterParsingError(error) {
		if (error instanceof Heket.NoMatchingAlternativeError) {
			let message = new Message_Reply_NeedMoreParameters();

			message.setAttemptedCommand(Enum_Commands.JOIN);

			return this.setImmediateResponse(message);
		}
	}

}

extend(Message_Command_Join.prototype, {
	command:       Enum_Commands.JOIN,
	abnf:          '( <channel-name> *("," <channel-name>) [" " <channel-key> *("," <channel-key>)] ) / "0"',
	channel_names: null,
	channel_keys:  null
});

module.exports = Message_Command_Join;
