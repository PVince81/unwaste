var DATE_FORMAT = 'YYYY-MM-DD',
    _ = require('underscore'),
    _s = require('underscore.string'),
    api = require('../api/api'),
    url = require('url'),
    querystring = require('querystring'),
    moment = require('moment');

exports.api = function(req, res){
    var aUrl,
        apiPath;
    console.log('API call ' + req.url);
    aUrl = url.parse(req.url);
    aUrl.params = querystring.parse(aUrl.query);

    console.log(aUrl);

    var sendInvalidRequest = function(){
        res.statusCode = 400;
        res.send({err: 'Invalid request'});
    };

    var sendObjectOrError = function(doStuff) {
        var func = function(obj, err) {
            if (obj) {
                console.log('returning object: ...');
                if (doStuff) {
                    doStuff(obj, err);
                }
                res.send(JSON.stringify(obj));
            }
            else if (err) {
                console.log('returning error: ', err);
                res.statusCode = 400;
                res.send(err)
            }
        }
        return func
    }
    var updateUid = function(obj, err) {
        if (obj.success) {
            console.log("user " + obj.uid + " added to session");
            req.session.user = {
                uid : obj.uid
            }
        }
    }

    if (aUrl.pathname === '/api/wastepoint' && req.method === 'POST' ){
        console.log('add wastepoint');
        if (!req.session.user) {
            console.error('Stranger in the night');
        }
        api.addWastePoint(req, req.session.user, sendObjectOrError());
    }
    else if (aUrl.pathname === '/api/wastepointimage' && req.method === 'GET') {
        api.getWastePointImage(aUrl.params, function(rows){
            if (rows.length && rows[0].img){
                var buf = new Buffer(rows[0].img.slice(22).toString(), 'base64');
                res.writeHead(200, {'content-type':'image/jpg'});
                res.end(buf, 'binary');
            }
            else{
                res.statusCode = 404;
                res.send();
            }
        });
    }
    else if (_s.startsWith(aUrl.pathname,'/api/wastepoint/done/') && req.method === 'GET' ){
        var id = aUrl.pathname.substring(aUrl.pathname.lastIndexOf('/') + 1);
        console.log("parsed: " + id);
        if (id) {
            api.markAsDone({id : parseInt(id,10)}, sendObjectOrError());
        }
        else{
            sendInvalidRequest();
        }
    }
    else if (_s.startsWith(aUrl.pathname,'/api/wastepoint/') && req.method === 'GET' ){
        var id = aUrl.pathname.substring(aUrl.pathname.lastIndexOf('/') + 1);
        console.log("parsed: " + id);
        if (id && (id != 'wastepoint')) {
            api.getWastePoint({id : parseInt(id,10)}, sendObjectOrError());
        }
        else{
            sendInvalidRequest();
        }
    }
    else if (_s.startsWith(aUrl.pathname,'/api/wastepoint') && req.method === 'GET' ){
            api.getWastePoints(aUrl.params, sendObjectOrError());
    }
    else if (aUrl.pathname === '/api/nearbywastepoint' && req.method === 'GET' ){
        api.getNearbyWastePoints(aUrl.params, sendObjectOrError());
    }
    else if (aUrl.pathname === '/api/register' && req.method === 'POST' ){
        api.register(req.body, sendObjectOrError(updateUid));
    }
    else if (aUrl.pathname === '/api/authenticate' && req.method === 'POST' ){
        api.authenticate(req.body, sendObjectOrError(updateUid));
    }
    else if (aUrl.pathname === '/api/oauthcallback' && req.method === 'GET' ){
        req.session.oauth.verifier = req.query.oauth_verifier;
        api.oauthCallback(req.session.oauth, function(results, err){
            if (err){
                console.error(err);
                res.statusCode = 400;
                res.send({err: 'oauth callback failed'});
                return;
            }
            console.log(results);
            req.session.oauth.accessToken = results.accessToken;
            req.session.oauth.accessTokenSecret = results.accessTokenSecret;
            res.redirect('/');
        });
    }
    else if (aUrl.pathname === '/api/oauth' && req.method === 'GET' ){
        api.oauth(function(result, err){
            if (err){
                console.error(err);
                res.statusCode = 400;
                res.send({err: 'oauth failed'});
                return;
            }
            req.session.oauth = {
                token: result.oauthToken,
                tokenSecret: result.oauthTokenSecret
            };
            console.log('oauth success', req.session.oauth);
			res.redirect('https://twitter.com/oauth/authenticate?oauth_token=' + result.oauthToken);
        });
    }
    else{
        res.statusCode = 404;
        res.send('');
    }
}
