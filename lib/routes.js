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

exports.api = function(req, res){
    var aUrl,
        apiPath;
    /*
    if (!req.session || !req.session.user){
        res.statusCode = 403;
        res.send('Forbidden');
        return;
    }
    */
    console.log('API call');
    aUrl = url.parse(req.url);
    aUrl.params = querystring.parse(aUrl.query);

    console.log(aUrl);

    if (aUrl.pathname === '/api/wastepoint' && req.method === 'POST' ){
        api.addWastePoint(req.body, function(obj, err){
            if (obj){
                res.send(JSON.stringify(obj));
            }
            else if (err){
                res.send(err);
            }
        });
    }
    else if (aUrl.pathname === '/api/wastepoint' && req.method === 'GET' ){
        api.getWastePoints(aUrl.params, function(obj, err){
            if (obj){
                res.send(JSON.stringify(obj));
            }
            else if (err){
                res.send(err);
            }
        });
    }
    else if (aUrl.pathname === '/api/nearbywastepoint' && req.method === 'GET' ){
        api.getNearbyWastePoints(aUrl.params, function(obj, err){
            if (obj){
                res.send(JSON.stringify(obj));
            }
            else if (err){
                res.send(err);
            }
        });
    }
    else if (aUrl.pathname === '/api/register' && req.method === 'POST' ){
        api.register(aUrl.params, function(obj, err){
            if (obj){
                if (obj.success) {
                    req.session.user = {
                    uid : obj.uid
                    };
                }
                res.send(JSON.stringify(obj));
            }
            else if (err){
                res.send(err);
            }
        });
    }
    else if (aUrl.pathname === '/api/authenticate' && req.method === 'POST' ){
        api.authenticate(aUrl.params, function(obj, err){
            if (obj){
                if (obj.success) {
                    req.session.user = {
                    uid : obj.uid
                    };
                }
                res.send(JSON.stringify(obj));
            }
            else if (err){
                res.send(err);
            }
        });
    }
    else{
        res.statusCode = 404;
        res.send('');
    }
}
