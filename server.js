var express = require('express'),
    path = require('path'),
    http = require('http'),
    passport = require('passport'),
    TwitterStrategy = require('passport-twitter').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    config = require('./settings.json'),
    routes = require('./lib/routes'),
    api = require('./api/api');

function setupPassport(app){
    app.use(passport.initialize());
    app.use(passport.session());

    if (config.auth.googleClientId){
        passport.use(new GoogleStrategy({
                clientID: config.auth.googleClientId,
                clientSecret: config.auth.googleConsumerSecret,
                callbackURL: config.baseUrl + '/auth/google/callback'
            },
            function(accessToken, refreshToken, profile, done) {
                console.log('OAUTH success');
                var options = {
                    // TODO: maybe let the user pick a name ?
                    login: profile.username,
                    oauthProvider: profile.provider,
                    oauthUserId: profile.id,
                    oauthToken: accessToken,
                    oauthSecret: refreshToken
                };
                api.findOrCreateUserOAuth(options, function(user, err){
                    done(err, user);
                });
            }
        ));
    }
    else{
        console.warn('OAUTH for Google not configured, please check settings.json');
    }

    if (config.auth.twitterConsumerKey){
        passport.use(new TwitterStrategy({
                consumerKey: config.auth.twitterConsumerKey,
                consumerSecret: config.auth.twitterConsumerSecret,
                callbackURL: config.baseUrl + '/auth/twitter/callback'
            },
            function(accessToken, refreshToken, profile, done) {
                console.log('OAUTH success');
                var options = {
                    // TODO: maybe let the user pick a name ?
                    login: profile.username,
                    oauthProvider: profile.provider,
                    oauthUserId: profile.id,
                    oauthToken: accessToken,
                    oauthSecret: refreshToken
                };
                api.findOrCreateUserOAuth(options, function(user, err){
                    done(err, user);
                });
            }
        ));
    }
    else{
        console.warn('OAUTH for Twitter not configured, please check settings.json');
    }

    passport.serializeUser(function(user, done) {
        console.log('serializeUser: ' + user.id)
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        api.getUserById(id, function(user, err){
            console.log('deserializeUser: ', user)
            if(!err) done(null, user);
            else done(err, null)
        });
    });

}

var app = express(),
    sessionStore = new express.session.MemoryStore();

app.configure(function () {
    var publicDir = process.env.publicDir || 'public';
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.compress());
    app.use(express.session({
        secret: 'Xua589WEj1c9878j!?ß42WECRWERWE34##432§"$1',
        cookie: {
            maxAge: 15 * 60 * 1000
        },
        store: sessionStore
    }));

    setupPassport(app);

    console.log('Serving public files from: ', publicDir);
    app.use(express.static(path.join(__dirname, publicDir)));

    app.get('/api/*', routes.api);
    app.post('/api/*', routes.api);

    app.get('/auth/google', passport.authenticate('google', { scope: 'openid profile'}));
    app.get('/auth/google/callback', passport.authenticate('google', {failureRedirect: '/login'}),
        function(req, res) { res.redirect('/'); });
    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {successRedirect: '/', failureRedirect: '/login'}),
        function(req, res) { res.redirect('/'); });

    app.get('*', function(req, res){
        res.statusCode = 404;
        res.send('Page not found');
    });
});


http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
