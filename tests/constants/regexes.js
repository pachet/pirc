
var
	Regexes = req('/constants/regexes');


function testNickRegexAgainstChannel(test) {
	test.expect(1);
	test.equals(
		Regexes.NICK.test('#foobar'),
		false
	);

	test.done();
}

function testUserIdentifier(test) {
	test.expect(4);

	test.ok(
		Regexes.NICK.test('morrigan'),
		'Make sure the nick identifier regex works as expected'
	);

	test.ok(
		Regexes.USER.test('~pirc'),
		'Make sure the user identifier regex works as expected'
	);

	test.ok(
		Regexes.HOST.test('::ffff:127.0.0.1'),
		'Make sure the host identifier regex works as expected'
	);

	test.ok(
		Regexes.CLIENT_IDENTIFIER.test('morrigan!~pirc@::ffff:127.0.0.1'),
		'Make sure the client identifier regex works against localhost and ipv6'
	);
	test.done();
}

module.exports = {
	testNickRegexAgainstChannel,
	testUserIdentifier
};