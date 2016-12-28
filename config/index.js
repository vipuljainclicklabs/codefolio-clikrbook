'use strict';
let config = {};
let myEnv = process.env.NODE_ENV.toLowerCase();
let mysql = require("mysql");
let myRedis;
let dbConnection;
let RedisModule = require('ioredis');
let redisConfig = require('config/redis.' + myEnv);
const winston = require('winston');
const fs = require('fs');
const logDir = 'log';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}
const tsFormat = () => (new Date()).toLocaleTimeString();
const myLogger = new (winston.Logger)({
    transports: [
        // colorize the output to the console
        new (winston.transports.Console)({
            timestamp: tsFormat,
            colorize: true,
            level: myEnv === 'development' ? 'silly' : 'info'
        }),
        new (require('winston-daily-rotate-file'))({
            filename: `${logDir}/-results.log`,
            timestamp: tsFormat,
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            level: myEnv === 'development' ? 'silly' : 'info'
        })
    ]
});
config.myLogger = myLogger;
config.auth = require('config/auth.' + myEnv);
config.db = require('config/db.' + myEnv);
config.constants = require('config/appConstants.' + myEnv);
config.amazon = require('config/aws.' + myEnv);
config.shopping = require('config/payment.' + myEnv);
config.redis = redisConfig;
config.socket = require('config/socket.' + myEnv);

if (process.env['REDIS_USE_UNIX_DOMAIN_SOCKET'] === 'true') {
    myRedis = new RedisModule(redisConfig.redisUniXSocketPath);
}
if (process.env['REDIS_USE_TCP'] === 'true') {
    myRedis = new RedisModule(redisConfig.redisTcpConfig)
}
let initConnectionToMySQL = function (dbConfig) {
    dbConnection = mysql.createConnection(dbConfig);
    // Recreate the connection, since
    // the old one cannot be reused.
    dbConnection.connect(function (err) {
        // The server is either down
        if (err) {
            // or restarting (takes a while sometimes).
            myLogger.error('error when connecting to db:', err);
            setTimeout(initConnectionToMySQL, 2000);
            // We introduce a delay before attempting to reconnect,
            //to avoid a hot loop, and to allow our node script to
            //process asynchronous requests in the meantime.
            //If you're also serving http, display a 503 error.
        } else {
            if (process.env['PREPARE_TABLES'] == 'true') {
                require("schema/mysql/bootstrap");
            }
            myLogger.info('Connected to MySQL');
        }
    });
    dbConnection.on('error', function (err) {
        myLogger.error('db error', err);
        myLogger.error('\nTRYING TO HANDLE DISCONNECT\n', err.code, typeof err.code);
        // Connection to the MySQL server is usually
        // lost due to either server restart, or a
        // connnection idle timeout (the wait_timeout
        // server variable configures this)
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            myLogger.info('\n TRYING TO CALL handleDisconnect \n', err);
            initConnectionToMySQL();
        } else {
            throw err;
        }
    });
};

initConnectionToMySQL(config.db.mysqlConfig);
const keepDBConnectionAlive = function () {
    dbConnection.query('SELECT 1',
        function (err, rows) {
            if (err) {
                myLogger.error('ERROR in query SELECT 1', err);
            } else {
                myLogger.info(rows);
            }
        });
};
setInterval(function () {
    keepDBConnectionAlive();
}, 60000);
config.mySqlConnection = dbConnection;
config.myRedisConnection = myRedis;
myRedis.set("TEST_REDIS_KEY", "TEST_REDIS_VALUE");
myRedis.get("TEST_REDIS_KEY", function (e, v) {
    if (e) {
        myLogger.error("Connection to Redis failed", e);
    }
    if (v && v == "TEST_REDIS_VALUE") {
        myLogger.info("Connected to Redis");
    } else {
        myLogger.error("Connection to Redis failed", e);
    }
});
//    { error: 0, warn: 1, info: 2, verbose: 3, debug: 4, silly: 5 }

// logger.debug('Debugging info');
// logger.verbose('Verbose info');
// logger.info('Hello world');
// logger.warn('Warning message');
// logger.error('Error info');
module.exports = config;

