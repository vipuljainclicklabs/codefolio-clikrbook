const config = require("config");
const mySqlConnection = config.mySqlConnection;
const tableName = 'loginuser';
const charset = "utf8";
const engine = "InnoDB";
const collate = "utf8_unicode_ci";
const fieldMap = {
    
    intId: "intId",
    email: "email",
    password: "password"
};

const createTable = `CREATE TABLE IF NOT EXISTS ${tableName} (
    ${fieldMap.intId} BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ${fieldMap.email} VARCHAR(20) NOT NULL PRIMARY KEY,
    ${fieldMap.password} VARCHAR(20) NOT NULL,
    UNIQUE KEY maskId (${fieldMap.intId})
     ) ENGINE=${engine} CHARACTER SET ${charset} COLLATE ${collate};`;

const dropInsertionTrigger = `DROP TRIGGER IF EXISTS tr_b_ins_${tableName};`;
const dropUpdationTrigger = `DROP TRIGGER IF EXISTS tr_b_update_${tableName};`;
// console.log(createTable);
// console.log(dropInsertionTrigger);
// console.log('DELIMITER $$');
// console.log(insertionTrigger);
// console.log('\n$$\nDELIMITER ;\n');
// console.log(dropUpdationTrigger);
// console.log('DELIMITER $$');
// console.log(updationTrigger);
// console.log('\n$$\nDELIMITER ;\n');
const prep = function () {
    if (process.env.MUST_DEBUG == 'true') {
        console.log('\n*******\nprepping ' + tableName + '\n*******\n');
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