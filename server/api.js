const express       =   require('express'),
      bodyParser    =   require('body-parser'),
      db            =   require('./database.js'),
      crypto        =   require('crypto'),
      config        =   require('../config.js'),
      api           =   express();

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({extended: true}));

/**
    Attempt to login with email and password
*/
api.post('/api/users/login', function(req, res) {
    // Get users with provided emails
    let hash = crypto.createHash('sha256');
    hash.update(req.body.password);
    db.query(`
        SELECT
            username, email, account_type
        FROM USER
        WHERE email = ? AND password = ?
    `, [ req.body.email, hash.digest('base64') ]).then(function(users) {
        if(typeof users == "undefined" || users.length == 0) {
            res.status(403).send("Incorrect username or password");
            return;
        }
        else {
            res.status(200).send({
                username: users[0].username,
                email: users[0].email,
                account_type: users[0].account_type
            });
        }
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Register visitor
*/
api.post('/api/visitors', function(req, res) {
    db.query(`
        SELECT * FROM USER WHERE username = ? OR email = ?
    `, [req.body.username, req.body.username]).then(function(users) {
        if(typeof users != "undefined" && users.length != 0) {
            res.status(403).send("User with the given email or username already exists");
            return;
        }
        else if(req.body.password.length < 8) {
            res.status(403).send("Password must be at least 8 characters long");
            return;
        }
        else {
            let hash = crypto.createHash('sha256');
            hash.update(req.body.password);
            db.query(`
                INSERT INTO USER
                VALUES (?, ?, ?, 'Visitor')
            `, [req.body.email, req.body.username, hash.digest('base64')]).then(function(result) {
                res.status(200).send("Success");
            }).catch(function(err) {
                res.status(500).send(err);
            });
        }
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Register user, along with its property and its farm items and link everything
*/
api.post('/api/owners', function(req, res) {
    db.query(`
        SELECT * FROM USER WHERE username = ? OR email = ?
    `, [req.body.owner.username, req.body.owner.username]).then(function(users) {
        if(typeof users != "undefined" && users.length != 0) {
            res.status(403).send("User with the given email or username already exists");
            return;
        }
        else if(req.body.owner.password.length < 8) {
            res.status(403).send("Password must be at least 8 characters long");
            return;
        }
        else {
            let hash = crypto.createHash('sha256');
            hash.update(req.body.owner.password);
            db.query(`
                INSERT INTO USER
                VALUES (?, ?, ?, 'Owner')
            `, [req.body.owner.email, req.body.owner.username, hash.digest('base64')]).then(function(result) {
                // Successfully created user
                db.query(`
                    INSERT INTO
                    PROPERTY (owner_id, name, st_address, city, zip, size, type, is_public, is_commercial)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [req.body.owner.username, req.body.property.name, req.body.property.st_address, req.body.property.city, req.body.property.zip,
                    req.body.property.size, req.body.property.type, req.body.property.is_public, req.body.property.is_commercial]).then(function(result) {
                    db.query(`
                        SELECT type FROM FARM_ITEM WHERE name = ?
                    `, [req.body.property.crop]).then(function(crops) {
                        if((req.body.property.type == 'Farm' && (crops[0].type != 'Nut' && crops[0].type != 'Fruit' && crops[0].type != 'Vegetable' && crops[0].type != 'Flower')) ||
                           (req.body.property.type == 'Orchard' && (crops[0].type != 'Nut' && crops[0].type != 'Fruit')) ||
                           (req.body.property.type == 'Garden' && (crops[0].type != 'Vegetable' && crops[0].type != 'Flower'))) {
                            res.status(403).send("The crop specified is incorrect type for the property type");
                            return;
                        }
                        db.query(`
                            INSERT INTO GROWS_RAISES
                            VALUES ((SELECT property_id FROM PROPERTY WHERE name = ?), ?)
                        `, [req.body.property.name, req.body.property.crop]).then(function(result) {
                            if(req.body.property.type == 'Farm') {
                                db.query(`
                                    SELECT type FROM FARM_ITEM WHERE name = ?
                                `, [req.body.property.animal]).then(function(crops) {
                                    if(crops[0].type != 'Animal') {
                                        res.status(403).send("The animal specified is not of type animal");
                                        return;
                                    }
                                    db.query(`
                                        INSERT INTO GROWS_RAISES
                                        VALUES ((SELECT property_id FROM PROPERTY WHERE name = ?), ?)
                                    `, [req.body.property.name, req.body.property.animal]).then(function(result) {
                                        res.status(200).send("Success");
                                    }).catch(function(err) {
                                        res.status(500).send(err);
                                        return;
                                    });
                                }).catch(function(err) {
                                    res.status(500).send(err);
                                    return;
                                });
                            }
                            else {
                                res.status(200).send("Success");
                            }
                        }).catch(function(err) {
                            res.status(500).send(err);
                            return;
                        });
                    }).catch(function(err) {
                        res.status(500).send(err);
                        return;
                    });
                }).catch(function(err) {
                    // delete user; send error
                    db.query(`
                        DELETE FROM USER WHERE username = ?
                    `, [req.body.owner.username]).then(function(result) {
                        res.status(500).send(err);
                        return;
                    }).catch(function(err) {
                        res.status(500).send(err);
                        return;
                    });
                });
            }).catch(function(err) {
                res.status(500).send(err);
                return;
            });
        }
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get owner's properties
*/
api.get('/api/owners/:owner_id/own_properties', function(req, res) {
    let sql = 'SELECT * FROM OwnerPropertiesView WHERE owner_id = ?';
    let inserts = [ req.params.owner_id ];
    if(req.query.filter) {
        let filter = req.query.filter.split(':');
        if(filter[1].indexOf('-') != -1) { // range filter
            let range = filter[1].split('-');
            if(range[0].length != 0) {
                sql += ' AND ?? >= ?';
                inserts.push(filter[0], range[0]);
            }
            if(range[1].length != 0) {
                sql += ' AND ?? <= ?';
                inserts.push(filter[0], range[1]);
            }
        }
        else {  // exact filter
            sql += ' AND ?? = ?';
            inserts.push(filter[0], filter[1]);
        }
    }
    if(req.query.sortby) {
        let sortby = req.query.sortby.split(',');
        sql += ` ORDER BY ?? ${(sortby.length > 1 && sortby[1] == 'desc' ? 'DESC' : 'ASC')}`;
        inserts.push(sortby[0]);
    }
    db.query(sql, inserts).then(function(properties) {
        res.status(200).send(properties);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get other owners' properties
*/
api.get('/api/owners/:owner_id/other_properties', function(req, res) {
    let sql = 'SELECT * FROM OwnerPropertiesView WHERE NOT owner_id = ? AND valid = 1';
    let inserts = [ req.params.owner_id ];
    if(req.query.filter) {
        let filter = req.query.filter.split(':');
        if(filter[1].indexOf('-') != -1) { // range filter
            let range = filter[1].split('-');
            if(range[0].length != 0) {
                sql += ' AND ?? >= ?';
                inserts.push(filter[0], range[0]);
            }
            if(range[1].length != 0) {
                sql += ' AND ?? <= ?';
                inserts.push(filter[0], range[1]);
            }
        }
        else {  // exact filter
            sql += ' AND ?? = ?';
            inserts.push(filter[0], filter[1]);
        }
    }
    if(req.query.sortby) {
        let sortby = req.query.sortby.split(',');
        sql += ` ORDER BY ?? ${(sortby.length > 1 && sortby[1] == 'desc' ? 'DESC' : 'ASC')}`;
        inserts.push(sortby[0]);
    }
    db.query(sql, inserts).then(function(properties) {
        res.status(200).send(properties);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get property with specified id
*/
api.get('/api/properties/:propid', function(req, res, next) {
    if(isNaN(req.params.propid)) {
        next();
        return;
    }
    db.query(`
        SELECT *
        FROM PropertyView
        WHERE property_id = ?
    `, [ req.params.propid ]).then(function(properties) {
        res.status(200).send(properties[0]);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get farm items, optionally filter by status
*/
api.get('/api/farm_items', function(req, res) {
    sql = `SELECT name, CAST(status AS UNSIGNED) AS status, type FROM FARM_ITEM`;
    let inserts = [];
    if(typeof req.query['confirmed'] !== 'undefined') {
        sql += ' WHERE status = ?';
        inserts.push(req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.query(sql, inserts).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all animals, optionally filter by status
*/
api.get('/api/animals', function(req, res) {
    sql = `SELECT name, CAST(status AS UNSIGNED) AS status, type FROM FARM_ITEM WHERE type = 'Animal'`;
    if(typeof req.query['confirmed'] !== 'undefined') {
        sql += ' AND status = ?';
        inserts.push(req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.query(sql, inserts).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all crops, optionally filter by status
*/
api.get('/api/crops', function(req, res) {
    sql = `SELECT name, CAST(status AS UNSIGNED) AS status, type FROM FARM_ITEM WHERE type = 'Fruit' OR type = 'Nut' OR type = 'Vegetable' OR type = 'Flower'`;
    if(typeof req.query['confirmed'] !== 'undefined') {
        sql += ' AND status = ?';
        inserts.push(req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.query(sql, inserts).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get orchard crops, optionally filter by status
*/
api.get('/api/crops/orchard', function(req, res) {
    sql = `SELECT name, CAST(status AS UNSIGNED) AS status, type FROM FARM_ITEM WHERE type = 'Fruit' OR type = 'Nut'`;
    let inserts = [];
    if(typeof req.query['confirmed'] !== 'undefined') {
        sql += ' AND status = ?';
        inserts.push(req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.query(sql, inserts).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get garden crops, optionally filter by status
*/
api.get('/api/crops/garden', function(req, res) {
    sql = `SELECT name, CAST(status AS UNSIGNED) AS status, type FROM FARM_ITEM WHERE type = 'Vegetable' OR type = 'Flower'`;
    let inserts = [];
    if(typeof req.query['confirmed'] !== 'undefined') {
        sql += ' AND status = ?';
        inserts.push(req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.query(sql, inserts).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all fruits, optionally filter by status
*/
api.get('/api/crops/fruits', function(req, res) {
    sql = `SELECT name, CAST(status AS UNSIGNED) AS status, type FROM FARM_ITEM WHERE type = 'Fruit'`;
    let inserts = [];
    if(typeof req.query['confirmed'] !== 'undefined') {
        sql += ' AND status = ?';
        inserts.push(req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.query(sql, inserts).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all nuts, optionally filter by status
*/
api.get('/api/crops/nuts', function(req, res) {
    sql = `SELECT name, CAST(status AS UNSIGNED) AS status, type FROM FARM_ITEM WHERE type = 'Nut'`;
    let inserts = [];
    if(typeof req.query['confirmed'] !== 'undefined') {
        sql += ' AND status = ?';
        inserts.push(req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.query(sql, inserts).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all vegetables, optionally filter by status
*/
api.get('/api/crops/vegetables', function(req, res) {
    sql = `SELECT name, CAST(status AS UNSIGNED) AS status, type FROM FARM_ITEM WHERE type = 'Vegetable'`;
    let inserts = [];
    if(typeof req.query['confirmed'] !== 'undefined') {
        sql += ' AND status = ?';
        inserts.push(req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.query(sql, inserts).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all flowers, optionally filter by status
*/
api.get('/api/crops/flowers', function(req, res) {
    sql = `SELECT name, CAST(status AS UNSIGNED) AS status, type FROM FARM_ITEM WHERE type = 'Flower'`;
    let inserts = [];
    if(typeof req.query['confirmed'] !== 'undefined') {
        sql += ' AND status = ?';
        inserts.push(req.query['confirmed'] == 'true' ? 1 : 0);
    }
    db.query(sql, inserts).then(function(animals) {
        res.status(200).send(animals);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Add new property
*/
api.post('/api/properties', function(req, res) {
    db.query(`
        INSERT INTO
        PROPERTY (owner_id, name, st_address, city, zip, size, type, is_public, is_commercial)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.body.owner_id, req.body.name, req.body.st_address, req.body.city, req.body.zip, req.body.size, req.body.type, req.body.is_public, req.body.is_commercial]).then(function(result) {
        db.query(`
            SELECT type FROM FARM_ITEM WHERE name = ?
        `, [req.body.crop]).then(function(crops) {
            if((req.body.type == 'Farm' && (crops[0].type != 'Nut' && crops[0].type != 'Fruit' && crops[0].type != 'Vegetable' && crops[0].type != 'Flower')) ||
               (req.body.type == 'Orchard' && (crops[0].type != 'Nut' && crops[0].type != 'Fruit')) ||
               (req.body.type == 'Garden' && (crops[0].type != 'Vegetable' && crops[0].type != 'Flower'))) {
                res.status(403).send("The crop specified is incorrect type for the property type");
                return;
            }
            db.query(`
                INSERT INTO GROWS_RAISES
                VALUES ((SELECT property_id FROM PROPERTY WHERE name = ?), ?)
            `, [req.body.name, req.body.crop]).then(function(result) {
                if(req.body.type == 'Farm') {
                    db.query(`
                        SELECT type FROM FARM_ITEM WHERE name = ?
                    `, [req.body.animal]).then(function(crops) {
                        if(crops[0].type != 'Animal') {
                            res.status(403).send("The animal specified is not of type animal");
                            return;
                        }
                        db.query(`
                            INSERT INTO GROWS_RAISES
                            VALUES ((SELECT property_id FROM PROPERTY WHERE name = ?), ?)
                        `, [req.body.name, req.body.animal]).then(function(result) {
                            res.status(200).send("Success");
                        }).catch(function(err) {
                            res.status(500).send(err);
                            return;
                        });
                    }).catch(function(err) {
                        res.status(500).send(err);
                        return;
                    });
                }
                else {
                    res.status(200).send("Success");
                }
            }).catch(function(err) {
                res.status(500).send(err);
                return;
            });
        }).catch(function(err) {
            res.status(500).send(err);
            return;
        });
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Modify property by owner or admin
*/
api.put('/api/properties/:prop_id', function(req, res) {
    db.query(`
        SELECT account_type FROM USER WHERE username = ?
    `, [req.body.username]).then(function(account) {
        let atype = account[0].account_type;
        let attrsql = `UPDATE PROPERTY SET approved_by_admin = ${atype == 'Admin' ? `'${req.body.username}'` : 'NULL'}`;
        let attrinserts = [];
        for(let attr in req.body) {
            if(req.body.hasOwnProperty(attr)) {
                if(attr == 'username') continue;
                if(attr == 'add_farm_items') {
                    let sql = `INSERT INTO GROWS_RAISES VALUES `;
                    let inserts = [];
                    for(let i=0; i<req.body[attr].length; i++) {
                        sql += `(?, ?), `;
                        inserts.push(req.params.prop_id, req.body[attr][i]);
                    }
                    sql = sql.slice(0, -2);
                    db.query(sql, inserts).catch(function(err) {res.status(500).send(err); return;});
                }
                else if(attr == 'remove_farm_items') {
                    let sql = `DELETE FROM GROWS_RAISES WHERE property_id = ? AND (`;
                    let inserts = [req.params.prop_id];
                    for(let i=0; i<req.body[attr].length; i++) {
                        sql += `farm_item_name = ? OR `;
                        inserts.push(req.body[attr][i]);
                    }
                    sql = sql.slice(0, -4) + ")";
                    db.query(sql, inserts).catch(function(err) {res.status(500).send(err); return;});
                }
                else {
                    attrsql += ", ?? = ?";
                    attrinserts.push(attr, req.body[attr]);
                }
            }
        }
        attrsql += ` WHERE property_id = ?`;
        attrinserts.push(req.params.prop_id);
        db.query(attrsql, attrinserts).then(function(result) {
            db.query(`
                DELETE FROM VISITS WHERE property_id = ?
            `, [req.params.prop_id]).then(function(result) {
                res.status(200).send("Success");
            }).catch(function(err) {
                res.status(500).send(err);
            });
        }).catch(function(err) {
            res.status(500).send(err);
        });
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Request a new animal
*/
api.post('/api/animals', function(req, res) {
    db.query(`
        SELECT * FROM USER WHERE username = ?
    `, [req.body.username]).then(function(users) {
        let status = 0;
        if(typeof users !== 'undefined' && users.length > 0 && users[0].account_type == 'Admin') {
            status = 1;
        }
        db.query('INSERT INTO FARM_ITEM VALUES (?, ?, ?)', [req.body.name, status, 'Animal']).then(function(result) {
            res.status(200).send("Success");
        }).catch(function(err) {
            res.status(500).send(err);
        });
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Request a new crop
*/
api.post('/api/crops', function(req, res) {
    db.query(`
        SELECT * FROM USER WHERE username = ?
    `, [req.body.username]).then(function(users) {
        let status = 0;
        if(typeof users !== 'undefined' && users.length > 0 && users[0].account_type == 'Admin') {
            status = 1;
        }
        db.query('INSERT INTO FARM_ITEM VALUES (?, ?, ?)', [req.body.name, status, req.body.type]).then(function(result) {
            res.status(200).send("Success");
        }).catch(function(err) {
            res.status(500).send(err);
        });
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get a list of all users
*/
api.get('/api/users', function(req, res) {
    db.query(`
        SELECT username, email, account_type FROM USER
    `, []).then(function(users) {
        res.status(200).send(users);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all visitors, searchable and sortable
*/
api.get('/api/visitors', function(req, res) {
    let sql = `
        SELECT
            u.username,
            u.email,
            (SELECT COUNT(*) FROM VISITS WHERE visitor_id = u.username) AS logged_visits
        FROM USER u
        WHERE account_type = 'Visitor'
    `;
    let inserts = [];
    if(req.query.filter) {
        let filter = req.query.filter.split(':');
        if(filter[1].indexOf('-') != -1) { // range filter
            let range = filter[1].split('-');
            if(range[0].length != 0) {
                sql += ' AND ?? >= ?';
                inserts.push(filter[0], range[0]);
            }
            if(range[1].length != 0) {
                sql += ' AND ?? <= ?';
                inserts.push(filter[0], range[1]);
            }
        }
        else {  // exact filter
            sql += ' AND ?? = ?';
            inserts.push(filter[0], filter[1]);
        }
    }
    if(req.query.sortby) {
        let sortby = req.query.sortby.split(',');
        sql += ` ORDER BY ?? ${(sortby.length > 1 && sortby[1] == 'desc' ? 'DESC' : 'ASC')}`;
        inserts.push(sortby[0]);
    }
    db.query(sql, inserts).then(function(visitors) {
        res.status(200).send(visitors);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get a list of all owners, searchable and sortable
*/
api.get('/api/owners', function(req, res) {
    let sql = `
        SELECT
            u.username,
            u.email,
            (SELECT COUNT(*) FROM PROPERTY WHERE owner_id = u.username) AS num_properties
        FROM USER u
        WHERE account_type = 'Owner'
    `;
    let inserts = [];
    if(req.query.filter) {
        let filter = req.query.filter.split(':');
        if(filter[1].indexOf('-') != -1) { // range filter
            let range = filter[1].split('-');
            if(range[0].length != 0) {
                sql += ' AND ?? >= ?';
                inserts.push(filter[0], range[0]);
            }
            if(range[1].length != 0) {
                sql += ' AND ?? <= ?';
                inserts.push(filter[0], range[1]);
            }
        }
        else {  // exact filter
            sql += ' AND ?? = ?';
            inserts.push(filter[0], filter[1]);
        }
    }
    if(req.query.sortby) {
        let sortby = req.query.sortby.split(',');
        sql += ` ORDER BY ?? ${(sortby.length > 1 && sortby[1] == 'desc' ? 'DESC' : 'ASC')}`;
        inserts.push(sortby[0]);
    }
    db.query(sql, inserts).then(function(owners) {
        res.status(200).send(owners);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    View all confirmed properties, searchable and sortable
*/
api.get('/api/properties/confirmed', function(req, res) {
    let sql = `
        SELECT *
        FROM AdminPropertiesView
        WHERE approved_by_admin IS NOT NULL
    `;
    let inserts = [];
    if(req.query.filter) {
        let filter = req.query.filter.split(':');
        if(filter[1].indexOf('-') != -1) { // range filter
            let range = filter[1].split('-');
            if(range[0].length != 0) {
                sql += ' AND ?? >= ?';
                inserts.push(filter[0], range[0]);
            }
            if(range[1].length != 0) {
                sql += ' AND ?? <= ?';
                inserts.push(filter[0], range[1]);
            }
        }
        else {  // exact filter
            sql += ' AND ?? = ?';
            inserts.push(filter[0], filter[1]);
        }
    }
    if(req.query.sortby) {
        let sortby = req.query.sortby.split(',');
        sql += ` ORDER BY ?? ${(sortby.length > 1 && sortby[1] == 'desc' ? 'DESC' : 'ASC')}`;
        inserts.push(sortby[0]);
    }
    db.query(sql, inserts).then(function(properties) {
        res.status(200).send(properties);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    View all unconfirmed properties, searchable and sortable
*/
api.get('/api/properties/unconfirmed', function(req, res) {
    let sql = `
        SELECT
            name,
            st_address,
            city,
            zip,
            size,
            type,
            is_public,
            is_commercial,
            property_id,
            owner_id
        FROM AdminPropertiesView
        WHERE approved_by_admin IS NULL
    `;
    let inserts = [];
    if(req.query.filter) {
        let filter = req.query.filter.split(':');
        if(filter[1].indexOf('-') != -1) { // range filter
            let range = filter[1].split('-');
            if(range[0].length != 0) {
                sql += ' AND ?? >= ?';
                inserts.push(filter[0], range[0]);
            }
            if(range[1].length != 0) {
                sql += ' AND ?? <= ?';
                inserts.push(filter[0], range[1]);
            }
        }
        else {  // exact filter
            sql += ' AND ?? = ?';
            inserts.push(filter[0], filter[1]);
        }
    }
    if(req.query.sortby) {
        let sortby = req.query.sortby.split(',');
        sql += ` ORDER BY ?? ${(sortby.length > 1 && sortby[1] == 'desc' ? 'DESC' : 'ASC')}`;
        inserts.push(sortby[0]);
    }
    db.query(sql, inserts).then(function(properties) {
        res.status(200).send(properties);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    View all approved farm items, searchable and sortable
*/
api.get('/api/farm_items/approved', function(req, res) {
    sql = `
        SELECT
            name,
            type
        FROM FARM_ITEM
        WHERE status = 1
    `;
    let inserts = [];
    if(req.query.filter) {
        let filter = req.query.filter.split(':');
        if(filter[1].indexOf('-') != -1) { // range filter
            let range = filter[1].split('-');
            if(range[0].length != 0) {
                sql += ' AND ?? >= ?';
                inserts.push(filter[0], range[0]);
            }
            if(range[1].length != 0) {
                sql += ' AND ?? <= ?';
                inserts.push(filter[0], range[1]);
            }
        }
        else {  // exact filter
            sql += ' AND ?? = ?';
            inserts.push(filter[0], filter[1]);
        }
    }
    if(req.query.sortby) {
        let sortby = req.query.sortby.split(',');
        sql += ` ORDER BY ?? ${(sortby.length > 1 && sortby[1] == 'desc' ? 'DESC' : 'ASC')}`;
        inserts.push(sortby[0]);
    }
    db.query(sql, inserts).then(function(farmitems) {
        res.status(200).send(farmitems);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    View all pending farm items, searchable and sortable
*/
api.get('/api/farm_items/pending', function(req, res) {
    sql = `
        SELECT
            name,
            type
        FROM FARM_ITEM
        WHERE status = 0
    `;
    let inserts = [];
    if(req.query.filter) {
        let filter = req.query.filter.split(':');
        if(filter[1].indexOf('-') != -1) { // range filter
            let range = filter[1].split('-');
            if(range[0].length != 0) {
                sql += ' AND ?? >= ?';
                inserts.push(filter[0], range[0]);
            }
            if(range[1].length != 0) {
                sql += ' AND ?? <= ?';
                inserts.push(filter[0], range[1]);
            }
        }
        else {  // exact filter
            sql += ' AND ?? = ?';
            inserts.push(filter[0], filter[1]);
        }
    }
    if(req.query.sortby) {
        let sortby = req.query.sortby.split(',');
        sql += ` ORDER BY ?? ${(sortby.length > 1 && sortby[1] == 'desc' ? 'DESC' : 'ASC')}`;
        inserts.push(sortby[0]);
    }
    db.query(sql, inserts).then(function(farmitems) {
        res.status(200).send(farmitems);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Validate crop or animal
*/
api.put('/api/farm_items/:id', function(req, res) {
    db.query(`
        SELECT * FROM USER WHERE username = ?
    `, [req.body.username]).then(function(users) {
        if(typeof users !== 'undefined' && users.length > 0 && users[0].account_type == 'Admin') {
            db.query(`
                UPDATE FARM_ITEM
                SET status = 1
                WHERE name = ?
            `, [req.params.id]).then(function(result) {
                res.status(200).send("Success");
            }).catch(function(err) {
                res.status(500).send(err);
            });
        }
        else {
            res.status(403).send("Unauthorized action");
        }
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Remove user
*/
api.delete('/api/users/:id', function(req, res) {
    db.query(`
        DELETE FROM USER
        WHERE (account_type = 'Visitor' OR account_type = 'Owner') AND username = ?
    `, [req.params.id]).then(function(result) {
        res.status(200).send("Success");
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Remove all visits from a visitor's history
*/
api.delete('/api/visitors/:id/visits', function(req, res) {
    db.query(`
        DELETE FROM VISITS WHERE visitor_id = ?
    `, [req.params.id]).then(function(result) {
        res.status(200).send("Success");
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all public, confirmed properties from a visitor's view, searchable, sortable
*/
api.get('/api/visitors/properties', function(req, res) {
    let sql = `
        SELECT *
        FROM VisitorPropertiesView
    `;
    let inserts = [];
    if(req.query.filter) {
        sql += ' WHERE';
        let filter = req.query.filter.split(':');
        if(filter[1].indexOf('-') != -1) { // range filter
            let range = filter[1].split('-');
            if(range[0].length != 0) {
                sql += ' ?? >= ?';
                inserts.push(filter[0], range[0]);
            }
            if(range[1].length != 0) {
                if(range[0].length != 0) sql += ' AND';
                sql += ' ?? <= ?';
                inserts.push(filter[0], range[1]);
            }
        }
        else {  // exact filter
            sql += ' ?? = ?';
            inserts.push(filter[0], filter[1]);
        }
    }
    if(req.query.sortby) {
        let sortby = req.query.sortby.split(',');
        sql += ` ORDER BY ?? ${(sortby.length > 1 && sortby[1] == 'desc' ? 'DESC' : 'ASC')}`;
        inserts.push(sortby[0]);
    }
    db.query(sql, inserts).then(function(properties) {
        res.status(200).send(properties);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Get all properties that a visitor has visited
*/
api.get('/api/visitors/:id/visits', function(req, res) {
    db.query(`
        SELECT name, date_added, score
        FROM VisitorHistoryLogView
        WHERE visitor_id = ?
    `, [req.params.id]).then(function(visits) {
        res.status(200).send(visits);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Visitor's view of a particular property, including whether the visitor has visited it
*/
api.get('/api/visitors/:id/properties/:propid', function(req, res) {
    db.query(`
        SELECT
            p.*,
            EXISTS(
                SELECT v.visitor_id
                FROM VISITS v, PROPERTY prop
                WHERE v.property_id = prop.property_id AND prop.property_id = p.property_id AND v.visitor_id = ?
            ) AS is_visited
        FROM PropertyView p
        WHERE p.property_id = ?
    `, [req.params.id, req.params.propid]).then(function(properties) {
        res.status(200).send(properties[0]);
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Log visit to property
*/
api.post('/api/properties/:id/visits', function(req, res) {
    db.query(`
        INSERT INTO VISITS
        VALUES (?, ?, ?, ?)
    `, [req.body.username, req.params.id, req.body.score, new Date().toISOString()]).then(function(result) {
        res.status(200).send("Success");
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Remove logged visit from property
*/
api.delete('/api/properties/:id/visits', function(req, res) {
    db.query(`
        DELETE FROM VISITS
        WHERE visitor_id = ? AND property_id = ?
    `, [req.body.username, req.params.id]).then(function(result) {
        res.status(200).send("Success");
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

/**
    Remove property
*/
api.delete('/api/properties/:id', function(req, res) {
    db.query(`
        DELETE FROM PROPERTY
        WHERE property_id = ?
    `, [req.params.id]).then(function(result) {
        res.status(200).send("Success");
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

api.listen(config.api.port);
console.log(`Server running on ${config.api.url}:${config.api.port}`);