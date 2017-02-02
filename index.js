'use strict';

process.env['PREPARE_TABLES'] = 'true';
process.env['MUST_DEBUG'] = 'true';
process.env['REDIS_USE_UNIX_DOMAIN_SOCKET'] = 'true';
process.env['REDIS_USE_TCP'] = 'false';
require('app-module-path').addPath(__dirname);

let environment;
if (process.env.NODE_ENV) {
    environment = process.env.NODE_ENV;
    environment = environment.toLowerCase();
    switch (environment) {
        case "production":
        case "testing":
            break;
        default:
            environment = "development";
    }
} else {
    environment = 'development';
}

process.env.NODE_ENV = environment;

if (environment !== 'development') {
    process.env['MUST_DEBUG'] = 'false';
}

const Path = require('path');
const Hapi = require('hapi');
const config = require("config");
const myLogger = config.myLogger;
const hapiAuthJWT = require('hapi-auth-jwt2');
const HapiSwagger = require('hapi-swagger');
const Pack = require('package');
var Handlebar=require('handlebars');

const swaggerOptions = {
    info: {
        'title': 'Skeleton API documentation',
        'version': Pack.version
    }
};

const requestValidator = function (decoded, request, callback) {
    return callback(null, decoded.valid);
};

const authConfig = config.auth;
const socketConfig = config.socket;
const server = new Hapi.Server({
    debug: {request: ['error']},
    connections: {
        router: {
            stripTrailingSlash: true
        },
        routes: {
            cors: true,
            files: {
                relativeTo: Path.join(__dirname, 'views')
            }
        }
    }
});
server.connection({
    routes: {cors: true},
    host: socketConfig.mainServer.ipAddress,
    port: socketConfig.mainServer.portNumber
});
server.register([
    require('inert'),
    require('vision'), {
        'register': HapiSwagger,
        'options': swaggerOptions
    }], (err) => {
    if (err) {
        myLogger.error('inert vision HapiSwagger', err);
    }
    server.views({
        engines:{
            html:Handlebar
        },
        path: 'views',
        layoutPath:'views'
    });
});

function sendTemplate(index,reply,data){
    reply.view(index,data);
}

server.route({
    method:'GET',
    path:'/{param*}',
    handler:{
        directory:{
            path:'.',
            redirectToSlash:true,
            index :true
        }
    }
});


server.register(hapiAuthJWT, function (err) {
    if (err) {
        myLogger.error('\n----- hapi-auth-jwt2 registeration failed ----\n', err);
    } else {
        myLogger.info('hapi-auth-jwt2 registered successfully');
    }
    /*server.auth.strategy('skeletonJwtAuth', 'jwt', true, {
        key: authConfig.jwt.privateKey,
        validateFunc: requestValidator,
        verifyOptions: {
            ignoreExpiration: false,
            algorithms: ['HS256']
        }
    });*/
    const routes = require('route');
    server.route(routes);
});
server.on('response', function (request) {
    myLogger.info(new Date(),
        request.info.remoteAddress + ': ' +
        request.method.toUpperCase() + ' ' +
        request.url.path +
        ' --> ' + request.response.statusCode);
});
server.start(function () {
    myLogger.info('Server started as', server.info.uri);
});

module.exports={sendTemplate:sendTemplate};