		// .appId('283596785077054')
		// .appSecret('34dd4e09693b2a9ea6cecb3b30bc8f82')

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , FacebookStrategy = require('passport-facebook').Strategy
  , mongoose = require('mongoose')
  , db = mongoose.connect('mongodb://localhost/geothon')
  , async = require('async')
  , schema = require('./schema.js');

var FACEBOOK_APP_ID = "283596785077054"
var FACEBOOK_APP_SECRET = "34dd4e09693b2a9ea6cecb3b30bc8f82";

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Facebook
//   profile), and invoke a callback with a user object.
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));




var app = express();

// configure Express
app.configure(function() {
	app.locals.pretty = true;
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
});


app.get('/', function(req, res){
	if(!req.user)
		res.render('login', { title: 'GeoThon' });	
	else {
	
		// .find({"created_on": {"$gte": start, "$lt": end}})
		var User = db.model('User', schema.user);
		User.findOne({fbid: req.user.id}, function(err, docs){
			if(err) {
				console.log(err);
			} else {
				req.user.faction = docs.factiune;
				req.user.leptoni = docs.leptoni;
				var Artefacts = db.model('Artefacts', schema.artefact);
				Artefacts.find({}, function(err, docs){
					if(err) {
						console.log(err);
					} else {
						res.render('index', {user : req.user, title: 'GeoThon', artefacts: JSON.stringify(docs)});
					}
				});
			}
		});

	}
});

function callback (err, data) {
	if(err) {
		console.log(err);
	} else {
		console.log('got results');
	}
}

function getArtefacts (callback) {
	var Artefacts = db.model('Artefacts', schema.artefact);
	Artefacts.find({}, function(err, docs){
		callback(err, docs);
	});
}

function getUser (id, callback) {
	var User = db.model('User', schema.user);
	User.findOne({fbid: id}, function(err, docs){
		callback(err, docs);
	});
}

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user, title: 'GeoThon' });
});

app.get('/login', function(req, res){

	var schema = mongoose.Schema({
		name: String,
		facultate: { type: String, default: 'not set' },
		munca: { type: String, default: 'not set' },
		fbid: { type: String, default: 'not set' },
		leptoni: { type: Number, default: 10 },
		artefacte: Array,
		bio: { type: String, default: 'not set' },
		factiune: {type: String, default: 'not set'}
	});

	var User = db.model('User', schema);
	User.findOne({fbid: req.user.id}, function(err, doc){
		if(err) {
			console.log(err);
			res.end();
		} else {
			req.user.faction = doc.factiune;
			res.render('login', { user: req.user, title: 'GeoThon' });
		}
	});
});

app.get('/add', function(req, res){

	read = require('fs').createReadStream;
	stream = read('/opt/apps/rpg/server/artifacts.txt');


	var schema = mongoose.Schema({
		name: String,
		descriere: { type: String, default: 'not set' },
		lat: Number,
		lng: Number,
		pret: { type: Number, default: 10 },
		owner: String,
		bids: [],
		radius: Number
	});

	var Artefacts = db.model('Artefacts', schema);

	var content = '';
	stream.on('data', function(data){
		content+=data;
	});
	stream.on('error', function(err){
		console.log(err);
	});
	stream.on('end', function(){
		console.log(content);

		var json = JSON.parse(content);

		json.forEach(function(a){
			console.log(a);
			var artefact = new Artefacts({
				name: a.name,
				lat: a.lat,
				lng: a.lng,
				pret: 1000,
				radius: 100

			});
			artefact.save(function(err){
				if(err) {
					console.log(err);
				} else {
					console.log('inserted');
				}
			});
		});

		res.end(content);

	});

});

app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });

app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {

	var schema = mongoose.Schema({
		name: String,
		facultate: { type: String, default: 'not set' },
		munca: { type: String, default: 'not set' },
		fbid: { type: String, default: 'not set' },
		leptoni: { type: Number, default: 10 },
		artefacte: Array,
		bio: { type: String, default: 'not set' },
		factiune: {type: String, default: 'not set'}
	});

	var User = db.model('User', schema);
	User.findOne({fbid: req.user.id}, function(err, doc){
		if(err) {
			console.log(err);
			res.redirect('/');
		} else {
			if(doc) {
				console.log('user found');
				req.user.faction = doc.factiune;
				console.log(req.user.faction, doc.factiune);
				res.redirect('/');
			} else {
				var user = new User({
					name: req.user.displayName,
					bio: req.user._json.bio,
					fbid: req.user.id
				});
				user.save(function(err){
					if(err) {
						console.log(err);
						res.redirect('/');
					} else {
						console.log('user saved');
						req.user.faction = 'not set';
						res.redirect('/');
					}
				});
			}
		}
	});
  });

app.get('/bid/:artefact/:user/:sum/:name', function(req, res){

	var artefact = req.params.artefact;
	var id = req.params.user;
	var sum = req.params.sum;
	var name = req.params.name;

	var Artefacts = db.model('Artefacts', schema.artefact);
	Artefacts.findOne({name: artefact}, function(err, doc){
		if(err) {
			console.log(err);
		} else {
			var found = 0;
			doc.bids.forEach(function(bid, idx){
				if(bid.id == id) {
					console.log('bid found');
					console.log(doc.bids[idx]);
					doc.bids[idx].sum = parseInt(doc.bids[idx].sum) + parseInt(sum);
					found = 1;
					console.log(doc.bids[idx]);
				}
			});
			if(!found)
				doc.bids.push({
					id: id,
					sum: sum,
					name: name
				});

			Artefacts.findOneAndUpdate({name: artefact}, {bids: doc.bids}, function(err){
				if(err) {
					console.log(err);
				} else {
					console.log('bid saved');
					res.end('bid saved');
				}
			});
		}
	});

});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/setfaction/:user/:faction', function(req, res){
	console.log(req.params.user, req.params.faction);

	var schema = mongoose.Schema({
		name: String,
		facultate: { type: String, default: 'not set' },
		munca: { type: String, default: 'not set' },
		fbid: { type: String, default: 'not set' },
		leptoni: { type: Number, default: 10 },
		artefacte: Array,
		bio: { type: String, default: 'not set' },
		factiune: {type: String, default: 'not set'}
	});

	var User = db.model('User', schema);
	User.findOneAndUpdate({fbid: req.params.user}, {factiune: req.params.faction}, function(err){
		if(err) {
			console.log(err);
		}
	});

	res.end('Faction set');
});

app.listen(3000);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
};