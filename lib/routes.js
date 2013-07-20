var DATE_FORMAT = 'YYYY-MM-DD',
    _ = require('underscore'),
    api = require('../api/api'),
    url = require('url'),
    querystring = require('querystring'),
    moment = require('moment');

exports.api = function(req, res){
    var aUrl,
        apiPath;
    console.log('API call');
    aUrl = url.parse(req.url);
    aUrl.params = querystring.parse(aUrl.query);

    console.log(aUrl);
    var sendObjectOrError = function(doStuff) {
        var func = function(obj, err) {
            if (obj) {
                if (doStuff) {
                    doStuff(obj, err);
                }
                res.send(JSON.stringify(obj));
            }
            else if (err) {
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
        if (!req.session.user) {
            res.send(JSON.stringify( { error: "not logged in"}));
        }
        else {
            api.addWastePoint(req, req.session.user, sendObjectOrError);
        }
    }
    else if (aUrl.pathname === '/api/wastepoint' && req.method === 'GET' ){
        api.getWastePoints(aUrl.params, sendObjectOrError);
    }
    else if (aUrl.pathname === '/api/nearbywastepoint' && req.method === 'GET' ){
        api.getNearbyWastePoints(aUrl.params, sendObjectOrError);
    }
    else if (aUrl.pathname === '/api/register' && req.method === 'POST' ){
        api.register(req.body, sendObjectOrError(updateUid));
    }
    else if (aUrl.pathname === '/api/authenticate' && req.method === 'POST' ){
        api.authenticate(req.body, sendObjectOrError(updateUid));
    }
    else{
        res.statusCode = 404;
        res.send('');
    }
}
