var DATE_FORMAT = 'YYYY-MM-DD',
    _ = require('underscore'),
    api = require('../api/api'),
    url = require('url'),
    querystring = require('querystring'),
    moment = require('moment');

function sendError(res, message, statusCode){
    res.statusCode = statusCode || 500;
    res.send(JSON.stringify({
        error: {
            message: message
        }
    }));

}

sendObjectOrError = function(obj, err) {
    if (obj) {
        res.send(JSON.stringify(obj));
    }
    else if (err) {
        res.send(err);
    }
}
sendObjectOrErrorUpdateSession = function(obj, err) {
    if (obj) {
        if (obj.success) {
            console.log("user " + obj.uid + " added to session");
            req.session.user = {
            uid : obj.uid
            };
        }
        res.send(JSON.stringify(obj));
    }
    else if (err){
        res.send(err);
    }
}

exports.api = function(req, res){
    var aUrl,
        apiPath;
    console.log('API call');
    aUrl = url.parse(req.url);
    aUrl.params = querystring.parse(aUrl.query);

    console.log(aUrl);

    if (aUrl.pathname === '/api/wastepoint' && req.method === 'POST' ){
        if (!req.session.user) {
            res.send(JSON.stringify( { error: "not logged in"}));
        }
        else {
            api.addWastePoint(req.body, req.session.user, sendObjectOrError);
        }
    }
    else if (aUrl.pathname === '/api/wastepoint' && req.method === 'GET' ){
        api.getWastePoints(aUrl.params, sendObjectOrError);
    }
    else if (aUrl.pathname === '/api/nearbywastepoint' && req.method === 'GET' ){
        api.getNearbyWastePoints(aUrl.params, sendObjectOrError);
    }
    else if (aUrl.pathname === '/api/register' && req.method === 'POST' ){
        api.register(req.body, sendObjectOrErrorUpdateSession);
    }
    else if (aUrl.pathname === '/api/authenticate' && req.method === 'POST' ){
        api.authenticate(req.body, sendObjectOrErrorUpdateSession);
    }
    else{
        res.statusCode = 404;
        res.send('');
    }
}
