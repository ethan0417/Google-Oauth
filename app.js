
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var partials = require('express-partials');
// Google config file path
var GoogleCfg = require('./cfg/config').google_config;

var passport = require('passport'),
		GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: GoogleCfg.google_client_id,
    clientSecret: GoogleCfg.google_client_secret,
    callbackURL: GoogleCfg.callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

var app = express();
app.use(partials());
// all environments
app.set('port', process.env.PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', 
	ensureAuthenticated, 
	function(req, res){
		res.render('account', { user: req.user });
	}
);

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/auth/google',
  passport.authenticate('google', 
  	{ scope: [
  		'https://www.googleapis.com/auth/userinfo.profile',
  		'https://www.googleapis.com/auth/userinfo.email'] 
  	}
  ),
  function(req, res){
    
  }
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  }
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
