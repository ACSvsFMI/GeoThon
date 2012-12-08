var mongoose = require('mongoose');

var user = mongoose.Schema({
	name: String,
	facultate: { type: String, default: 'not set' },
	munca: { type: String, default: 'not set' },
	fbid: { type: String, default: 'not set' },
	leptoni: { type: Number, default: 10 },
	artefacte: Array,
	bio: { type: String, default: 'not set' },
	factiune: {type: String, default: 'not set'}
});

var artefact = mongoose.Schema({
	name: String,
	descriere: { type: String, default: 'not set' },
	lat: Number,
	lng: Number,
	pret: { type: Number, default: 10 },
	owner: String,
	bids: []
});

module.exports.user = user;
module.exports.artefact = artefact;