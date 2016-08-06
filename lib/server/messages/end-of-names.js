var req = require('req');

var
	extend         = req('/utilities/extend'),
	ServerMessage  = req('/lib/server/message'),
	NumericReplies = req('/constants/numeric-replies'),
	StructureItems = req('/constants/structure-items');

class ServerEndOfNamesMessage extends ServerMessage {

}

extend(ServerEndOfNamesMessage.prototype, {

	numeric_reply:        NumericReplies.RPL_ENDOFNAMES,
	body:                 'End of /NAMES list.',

	structure_definition: [
		StructureItems.SERVER_NAME,
		StructureItems.NUMERIC_REPLY,
		StructureItems.NICK,
		StructureItems.CHANNEL_NAME,
		StructureItems.BODY
	]

});

module.exports = ServerEndOfNamesMessage;