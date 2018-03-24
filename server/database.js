const mysql         =   require('mysql'),
      config        =   require('../config.js');

const pool = mysql.createPool(config.mysql_settings);

function select(fields, table, conditions) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, connection) {
            if(err) {
                connection.release();
                reject(err);
                return;
            }
            let sql = "";
            let inserts = [];
            if(fields instanceof Array) {
                sql = "SELECT ?? FROM ??";
                inserts = [ fields, table ];
            }
            else {
                sql = `SELECT ${fields} FROM ??`;
                inserts = [ table ];
            }
            if(typeof conditions !== "undefined") {
                sql += " WHERE ";
                if(conditions instanceof Object) {
                    for(let attr in conditions) {
                        if(conditions.hasOwnProperty(attr)) {
                            if(typeof conditions[attr] == 'string' && (conditions[attr].toLowerCase() == "null" || conditions[attr].toLowerCase() == "not null")) {
                                sql += `?? IS ${conditions[attr].toUpperCase()} AND `;
                                inserts.push(attr);
                            }
                            else {
                                sql += "?? = ? AND ";
                                inserts.push(attr, conditions[attr]);
                            }
                        }
                    }
                    sql = sql.slice(0, -5);
                }
                else {
                    sql += `${conditions}`;
                }
            }
            connection.query(sql, inserts, function(err, result) {
                connection.release();
                if(err) {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(JSON.stringify(result)));
                return;
            });
        });
    });
}

function insert(table, fields, values) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, connection) {
            if(err) {
                connection.release();
                reject(err);
                return;
            }
            let sql = "INSERT INTO ?? (??) VALUES (?)";
            let inserts = [ table, fields, values ];
            connection.query(sql, inserts, function(err, result) {
                connection.release();
                if(err) {
                    reject(err);
                    return;
                }
                resolve(JSON.parse(JSON.stringify(result)));
                return;
            });
        });
    });
}

function update(table, fields, values) {
    
}

function remove(table, fields, values) {
    
}

module.exports = {
    select,
    insert,
    update,
    remove
};