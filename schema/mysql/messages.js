'use strict';
const config = require('config');
const mySqlConnection = config.mySqlConnection;
const tableName = 'messages';
const collate = 'utf8_unicode_ci';
const charset = 'utf8';
const engine = 'InnoDB';
/**
 *@param:
 *  type:-DB_NOT_INITIALIZED_PROPERLY,PLEASE_TRY_AGAIN,...
 *  statusCode:- 400,401,...
 *  messageType:- ERROR,SUCCESS,...,
 *  layerType: db,notFound,....
 */
const fieldMap = {
    id: 'id',
    intId: 'intId',
    type: 'type',
    statusCode: 'statusCode',
    messageType: 'messageType',
    layerType: 'layerType',
    createdOn: 'createdOn',
    updatedOn: 'updatedOn'

};
const createTable = `CREATE TABLE IF NOT EXISTS ${tableName} (
    \`${fieldMap.id}\` binary(16) NOT NULL PRIMARY KEY,
    \`${fieldMap.intId}\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    \`${fieldMap.type}\` VARCHAR(200) DEFAULT NULL,
    \`${fieldMap.statusCode}\` INT DEFAULT 400,
    \`${fieldMap.messageType}\` VARCHAR(50) DEFAULT NULL,
    \`${fieldMap.layerType}\` VARCHAR(50) DEFAULT NULL,
    \`${fieldMap.createdOn}\` BIGINT UNSIGNED DEFAULT NULL,
    \`${fieldMap.updatedOn}\` BIGINT UNSIGNED DEFAULT NULL,
    UNIQUE KEY maskId (${fieldMap.intId}),
    CONSTRAINT ${tableName}_messages_unq UNIQUE (${fieldMap.type})
    ) ENGINE=${engine} CHARACTER SET ${charset} COLLATE ${collate};`;

const insertionTrigger = `
create trigger tr_b_ins_${tableName} before insert on ${tableName} for each row
begin
    if (new.createdOn is null)
    then
    set new.createdOn = unix_timestamp();
    end if;
end;
`;
const updationTrigger = `
CREATE TRIGGER tr_b_update_${tableName} BEFORE UPDATE ON ${tableName}
 FOR EACH ROW
 BEGIN
     IF (NEW.updatedOn is null) THEN
         SET NEW.updatedOn = unix_timestamp();
     END IF;
 END;
`;
const dropInsertionTrigger = `DROP TRIGGER IF EXISTS tr_b_ins_${tableName};`;
const dropUpdationTrigger = `DROP TRIGGER IF EXISTS tr_b_update_${tableName};`;
const prep = function () {
    if (process.env.MUST_DEBUG == 'true') {
        console.log('\n*******\n prepping ' + tableName + '\n*******\n');
    }
    mySqlConnection.beginTransaction(function (err) {
        if (err) {
            throw err;
        }
        mySqlConnection.query(createTable, function (err, result) {
            if (err) {
                return mySqlConnection.rollback(function () {
                    throw err;
                });
            }
            mySqlConnection.query(dropInsertionTrigger, function (err, result) {
                if (err) {
                    return mySqlConnection.rollback(function () {
                        throw err;
                    });
                }
                mySqlConnection.query(dropUpdationTrigger, function (err, result) {
                    if (err) {
                        return mySqlConnection.rollback(function () {
                            throw err;
                        });
                    }
                    mySqlConnection.query(insertionTrigger, function (err, result) {
                        if (err) {
                            return mySqlConnection.rollback(function () {
                                throw err;
                            });
                        }
                        mySqlConnection.query(updationTrigger, function (err, result) {
                            if (err) {
                                return mySqlConnection.rollback(function () {
                                    throw err;
                                });
                            }
                            mySqlConnection.commit(function (err) {
                                if (err) {
                                    return mySqlConnection.rollback(function () {
                                        throw err;
                                    });
	                            }
	                            require( "schema/mysql/relMessageLanguage" );
                                if (process.env.MUST_DEBUG == 'true') {
                                    console.log('\nSuccess in ' + tableName + ' table:\n');
                                }
                            });
                        });
                    });
                });
            });
        });
    });
};
if (process.env['PREPARE_TABLES'] == 'true') {
    prep();
}
module.exports = {
    tableName: tableName,
    fieldMap: fieldMap
};