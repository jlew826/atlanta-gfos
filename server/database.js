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
                sql = "SELECT ??";
                inserts = [ fields ];
            }
            else {
                sql = `SELECT ${fields}`;
            }
            if(table instanceof Array) {
                sql = `${sql} FROM ${table[0]}`;
            }
            else {
                sql = `${sql} FROM ??`;
                inserts.push(table);
            }
            if(typeof conditions !== "undefined" && Object.keys(conditions).length > 0) {
                sql += " WHERE ";
                if(conditions instanceof Object) {
                    for(let attr in conditions) {
                        if(conditions.hasOwnProperty(attr)) {
                            if(typeof conditions[attr] == 'string' && (conditions[attr].toLowerCase() == "null" || conditions[attr].toLowerCase() == "not null")) {
                                sql += `?? IS ${conditions[attr].toUpperCase()} AND `;
                                inserts.push(attr);
                            }
                            else if(typeof conditions[attr] == 'string' && conditions[attr].charAt(0) == '~') {
                                sql += "NOT ?? = ? AND ";
                                inserts.push(attr, conditions[attr].slice(1));
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

function update(table, fields, values, conditions) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, connection) {
            if(err) {
                connection.release();
                reject(err);
                return;
            }
            let sql = "UPDATE ?? SET ";
            let inserts = [ table ];
            for(let i = 0; i < fields.length; i++) {
                sql += "?? = ?";
                inserts.push(fields[i], values[i]);
                if(i != fields.length - 1) sql += ", ";
            }
            if(typeof conditions !== "undefined" && Object.keys(conditions).length > 0) {
                sql += " WHERE ";
                if(conditions instanceof Object) {
                    for(let attr in conditions) {
                        if(conditions.hasOwnProperty(attr)) {
                            if(typeof conditions[attr] == 'string' && (conditions[attr].toLowerCase() == "null" || conditions[attr].toLowerCase() == "not null")) {
                                sql += `?? IS ${conditions[attr].toUpperCase()} AND `;
                                inserts.push(attr);
                            }
                            else if(typeof conditions[attr] == 'string' && conditions[attr].charAt(0) == '~') {
                                sql += "NOT ?? = ? AND ";
                                inserts.push(attr, conditions[attr].slice(1));
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

function remove(table, conditions) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, connection) {
            if(err) {
                connection.release();
                reject(err);
                return;
            }
            let sql = "DELETE FROM ??";
            let inserts = [ table ];
            if(typeof conditions !== "undefined") {
                sql += " WHERE ";
                if(conditions instanceof Object && Object.keys(conditions).length > 0) {
                    for(let attr in conditions) {
                        if(conditions.hasOwnProperty(attr)) {
                            if(typeof conditions[attr] == 'string' && (conditions[attr].toLowerCase() == "null" || conditions[attr].toLowerCase() == "not null")) {
                                sql += `?? IS ${conditions[attr].toUpperCase()} AND `;
                                inserts.push(attr);
                            }
                            else if(typeof conditions[attr] == 'string' && conditions[attr].charAt(0) == '~') {
                                sql += "NOT ?? = ? AND ";
                                inserts.push(attr, conditions[attr].slice(1));
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

function custom(sql, inserts) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, connection) {
            if(err) {
                connection.release();
                reject(err);
                return;
            }
            connection.query(sql, inserts, function(err, result) {
                connection.release();
                if(err) {
                    reject(err);
                    return;
                }
                resolve(result);
                return;
            });
        });
    });
}

module.exports = {
    select,
    insert,
    update,
    remove,
    custom
};