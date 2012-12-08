		// .appId('283596785077054')
		// .appSecret('34dd4e09693b2a9ea6cecb3b30bc8f82')

var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , FacebookStrategy = require('passport-facebook').Strategy
  , mongoose = require('mongoose')
  , db = mongoose.connect('mongodb://localhost/geothon');

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
				res.render('index', { user: req.user, title: 'GeoThon' });
			}
		});
	}
});

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
		facultate: { type: String, default: 'not set' },
		munca: { type: String, default: 'not set' },
		fbid: { type: String, default: 'not set' },
		leptoni: { type: Number, default: 10 },
		artefacte: Array,
		bio: { type: String, default: 'not set' },
		factiune: {type: String, default: 'not set'}
	});

	var User = db.model('User', schema);

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
}