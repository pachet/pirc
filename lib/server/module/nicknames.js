var
	extend = require('../../utility/extend');

var
	Server_Module      = require('../../server/module'),
	Validator_Nickname = require('../../validator/nickname');

var
	Enum_Commands    = require('../../enum/commands'),
	Enum_ModuleTypes = require('../../enum/module-types');

var
	Message_Reply_NicknameInUse     = require('../../message/reply/nickname-in-use'),
	Message_Reply_ErroneousNickname = require('../../message/reply/erroneous-nickname'),
	Message_Reply_NoNicknameGiven   = require('../../message/reply/no-nickname-given'),
	Message_Reply_Restricted        = require('../../message/reply/restricted');



class Server_Module_Nicknames extends Server_Module {

	constructor() {
		super();
		this.nicknames_to_clients = { };
	}

	registerClient(client, callback) {
		var nickname = client.getUserDetails().getNickname();

		if (this.hasClientForNickname(nickname)) {
			this.sendNicknameInUseMessageToClientForNickname(client, nickname);

			let error = new Error('Nickname already in use: ' + nickname);

			return void callback(error);
		}

		return void callback(null);
	}

	coupleToClient(client) {
		var user_details = client.getUserDetails();

		if (user_details.hasNickname()) {
			this.setClientForNickname(client, user_details.getNickname());
		}
	}

	decoupleFromClient(client) {
		var user_details = client.getUserDetails();

		if (user_details.hasNickname()) {
			delete this.nicknames_to_clients[user_details.getNickname()];
		}
	}

	getClientForNickname(nickname) {
		return this.nicknames_to_clients[nickname];
	}

	setClientForNickname(client, nickname) {
		this.nicknames_to_clients[nickname] = client;
	}

	hasClientForNickname(nickname) {
		return this.getClientForNickname(nickname) !== undefined;
	}

	handleClientNickMessage(client, message) {
		var nickname = message.getNickname();

		if (!nickname) {
			return this.sendNoNicknameGivenMessageToClient(client);
		}

		if (client.isRestricted()) {
			return this.sendRestrictedMessageToClient(client);
		}

		var existing_client = this.getClientForNickname(nickname);

		if (existing_client === client) {
			// TODO: reexamine this...
			return;
		}

		if (existing_client !== undefined) {
			return void this.sendNicknameInUseMessageToClientForNickname(
				client,
				nickname
			);
		}

		try {
			Validator_Nickname.validate(nickname);
		} catch (error) {
			return this.sendErroneousNicknameMessageToClientForNickname(
				client,
				nickname
			);
		}

		this.getObserversForClient(client).forEach(function each(observer) {
			observer.sendMessage(message);
		}, this);

		client.getUserDetails().setNickname(nickname);
	}

	handleClientMessage(client, message) {
		var command = message.getCommand();

		switch (command) {
			case Enum_Commands.NICK:
				return this.handleClientNickMessage(client, message);

			default:
				throw new Error(`Invalid command: ${command}`);
		}
	}

	sendNoNicknameGivenMessageToClient(client) {
		var message = new Message_Reply_NoNicknameGiven();

		return void client.sendMessage(message);
	}

	sendRestrictedMessageToClient(client) {
		var message = new Message_Reply_Restricted();

		return void client.sendMessage(message);
	}

	sendNicknameInUseMessageToClientForNickname(client, nickname) {
		var message = new Message_Reply_NicknameInUse();

		message.setNickname(nickname);

		return void client.sendMessage(message);
	}

	sendErroneousNicknameMessageToClientForNickname(client, nickname) {
		var message = new Message_Reply_ErroneousNickname();

		message.setNickname(nickname);

		return void client.sendMessage(message);
	}

}

extend(Server_Module_Nicknames.prototype, {
	type:                 Enum_ModuleTypes.NICKNAMES,
	nicknames_to_clients: null
});

module.exports = Server_Module_Nicknames;
