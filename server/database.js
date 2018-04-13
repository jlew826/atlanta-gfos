const mysql         =   require('mysql'),
      config        =   require('../config.js');

const pool = mysql.createPool(config.mysql_settings);

function query(sql, inserts) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, connection) {
            if (err) {
                connection.release();
                reject(err);
                return;
            }
            connection.query(sql, inserts, function(err, result) {
                connection.release();
                if (err) {
                    reject(err);
                    return;
                }
                
                resolve(JSON.parse(JSON.stringify(result)));
                return;
            });
        });
    });
}

module.exports = {
    query
};
