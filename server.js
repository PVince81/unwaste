var express = require('express'),
    path = require('path'),
    http = require('http'),
    routes = require('./lib/routes');

var app = express(),
    sessionStore = new express.session.MemoryStore();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));  /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
        secret: 'a589WEj1c9878j!?ß42WECRWERWE34##432§"$1',
        cookie: {
            maxAge: 15 * 60 * 1000
        },
        store: sessionStore
    }));
    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/api/*', routes.api);
    app.post('/api/*', routes.api);
    app.get('*', function(req, res){
        res.statusCode = 404;
        res.send('Page not found');
    });
});


http.createServer(app).listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});
