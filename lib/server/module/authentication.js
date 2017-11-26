
var
	DNS    = require('dns'),
	Promix = require('promix');

var
	extend     = require('../../utility/extend'),
	has        = require('../../utility/has'),
	isFunction = require('../../utility/is-function');

var
	Server_Module                  = require('../../server/module'),
	Message_Command_Notice         = require('../../message/command/notice'),
	Message_Reply_PasswordMismatch = require('../../message/reply/password-mismatch');

var
	Enum_ModuleTypes = require('../../enum/module-types');


class Server_Module_Authentication extends Server_Module {

	coupleToClient(client) {
		// noop for now
	}

	decoupleFromClient(client) {
		// noop for now
	}

	registerClient(client, callback) {
		var chain = Promix.chain();

		chain.and(this.resolveHostnameForClient, client).bind(this);
		chain.then(this.authenticateClient, client).bind(this);
		chain.callback(callback);
	}

	authenticateClient(client, callback) {
		client.setIsAuthenticated(false);

		if (!this.hasAuthenticationCallback()) {
			if (client.hasPassword()) {
				let error = new Error(
					'Client specified password, but no auth mechanism set'
				);

				this.sendPasswordMismatchMessageToClient(client);

				return void callback(error);
			}

			return void callback(null);
		}

		var auth_callback = this.getAuthenticationCallback();

		var parameters = {
			nickname: client.getNickname(),
			username: client.getUsername(),
			password: client.getPassword()
		};

		function handler(error) {
			if (error) {
				this.sendPasswordMismatchMessageToClient(client);
				return void callback(error);
			}

			client.setIsAuthenticated(true);

			return void callback(null);
		}

		auth_callback(parameters, handler.bind(this));
	}

	sendPasswordMismatchMessageToClient(client) {
		var message = new Message_Reply_PasswordMismatch();

		client.sendMessage(message);
	}

	hasAuthenticationCallback() {
		return this.getAuthenticationCallback() !== null;
	}

	getAuthenticationCallback() {
		return this.authentication_callback;
	}

	setAuthenticationCallback(callback) {
		if (!isFunction(callback)) {
			throw new Error('Must supply a function callback');
		}

		this.authentication_callback = callback;
		return this;
	}

	resolveHostnameForClient(client, callback) {
		this.sendHostnameLookupNoticeToClient(client);

		function handler(error, hostname) {
			if (error) {
				client.setHostname(client.getIP());
				this.sendHostnameLookupFailureNoticeToClient(client, error);
			} else {
				client.setHostname(hostname);
				this.sendHostnameLookupSuccessNoticeToClient(client);
			}

			callback(null);
		}

		this.lookupHostnameForClient(client, handler.bind(this));
	}

	lookupHostnameForClient(client, callback) {
		var ip = client.getIP();

		DNS.reverse(ip, function handler(error, hostnames) {
			if (error) {
				return void callback(error);
			}

			if (!hostnames.length) {
				let error = new Error('No matching hostnames found');

				return void callback(error);
			}

			var hostname = hostnames[0];

			DNS.resolve(hostname, function handler(error, addresses) {
				if (error) {
					return void callback(error);
				}

				if (!addresses.length) {
					let error = new Error('No matching DNS records found');

					return void callback(error);
				}

				if (!has(addresses, ip)) {
					let error = new Error('Your IP and hostname don\'t match');

					return void callback(error);
				}

				return void callback(null, hostname);
			});
		});
	}

	handleHostnameLookupSuccess() {
		throw new Error('implement');
	}

	sendHostnameLookupNoticeToClient(client) {
		var message = new Message_Command_Notice();

		message.setMessageBody('*** Looking up your hostname...');
		client.sendMessage(message);
	}

	sendHostnameLookupFailureNoticeToClient(client, error) {
		var
			message      = new Message_Command_Notice(),
			ip_address   = client.getIP(),
			error_string = error.toString().replace('Error: ', '');

		message.setMessageBody(
			`*** Could not resolve your hostname: ${error_string}; using your IP address (${ip_address}) instead.`
		);

		client.sendMessage(message);
	}

	sendHostnameLookupSuccessNoticeToClient(client) {
		var
			message  = new Message_Command_Notice(),
			hostname = client.getUserDetails().getHostname();

		message.setMessageBody(`*** Found your hostname (${hostname})`);

		client.sendMessage(message);
	}

}

extend(Server_Module_Authentication.prototype, {
	name:                    'Auth',
	type:                    Enum_ModuleTypes.AUTHENTICATION,
	authentication_callback: null
});

module.exports = Server_Module_Authentication;