const express       =   require('express'),
      bodyParser    =   require('body-parser'),
      mysql         =   require('mysql'),
      crypto        =   require('crypto'),
      config        =   require('../config.js'),
      api           =   express();

const pool = mysql.createPool(config.mysql_settings);

api.use(bodyParser.json());
api.use(bodyParser.urlencoded({extended: true}));

/**
    Attempt to login with email and password
*/
api.post('/api/users/login', function(req, res) {
    pool.getConnection(function(err, con) {
        if(err) {
            res.send(err);
            con.release();
            return;
        }
        // Get users with provided emails
        let sql = "SELECT * FROM USER WHERE email = ?";
        let inserts = [req.body.email];
        con.query(sql, inserts, function(err, result) {
            let data = JSON.parse(JSON.stringify(result))[0];
            con.release();
            if(err) {
                res.send(err);
                return;
            }
            // If no users match the email, user does not exist
            if(typeof result == "undefined" || result.length == 0) {
                res.send("No user with email " + req.body.email);
                return;
            }
            // Otherwise, hash password and compare with stored one
            let hash = crypto.createHash('sha256');
            hash.update(req.body.password);
            if(data.password == hash.digest('base64')) {
                res.send(JSON.stringify({
                    username: data.username,
                    email: data.email,
                    account_type: data.account_type
                }));
            }
            else {
                res.send("Incorrect password");
            }
        });
    });
});

/**
    Register visitor
*/
api.post('/api/visitors', function(req, res) {
    createUser(req.body, 'Visitor').then(function(result) {
        res.send("Success");
    }).catch(function(err) {
        res.send(err);
    });
});

/**
    Register user, along with its property and its farm items and link everything
*/
api.post('/api/owners', function(req, res) {
    // Create user first
    createUser(req.body.owner, 'Owner').then(function(result) {
        // Then create property
        createProperty(req.body.property, req.body.owner.username).then(function(prop_result) {
            res.send("Success");
        }).catch(function(err) {
            res.send(err);
        });
    }).catch(function(err) {
        res.send(err);
    });
});

api.listen(config.api.port);
console.log(`Server running on ${config.api.url}:${config.api.port}`);

/**
    Create user based on args (username, email, password) and account type
*/
function createUser(args, type) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, con) {
            if(err) {
                con.release();
                reject(err);
                return;
            }
            // Check to make sure no other user exists with either the same username or email
            let sql = "SELECT * FROM USER WHERE username = ? OR email = ?";
            let inserts = [
                args.username,
                args.email
            ];
            con.query(sql, inserts, function(err, result) {
                if(err) {
                    con.release();
                    reject(err);
                    return;
                }
                if(typeof result != "undefined" && result.length > 0) {
                    con.release();
                    reject("User with the given email or username already exists");
                    return;
                }
                // Insert new user with hashed password
                let sql = "INSERT INTO USER (username, email, password, account_type) VALUES (?)";
                let hash = crypto.createHash('sha256');
                hash.update(args.password);
                let inserts = [
                    [
                        args.username,
                        args.email,
                        hash.digest('base64'),
                        type
                    ]
                ];
                con.query(sql, inserts, function(err, result) {
                    con.release();
                    if(err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                    return;
                });
            });
        });
    });
}

/**
    Create new property with args (name, is_commercial, is_public, size, st_address, city, zip, type, [animal], crop) and owner id, and create its farm items and link them
*/
function createProperty(args, ownerid) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, con) {
            if(err) {
                con.release();
                reject(err);
                return;
            }
            // First, create new property
            let sql = "INSERT INTO PROPERTY (name, is_commercial, is_public, approved_by_admin, size, owner_id, st_address, city, zip, type) VALUES (?)";
            let inserts = [
                [
                    args.name,
                    args.is_commercial,
                    args.is_public,
                    null,
                    args.size,
                    ownerid,
                    args.st_address,
                    args.city,
                    args.zip,
                    args.type
                ]
            ];
            con.query(sql, inserts, function(err, result) {
                if(err) {
                    con.release();
                    reject(err);
                    return;
                }
                // Get property_id of newly created property
                let sql = "SELECT property_id FROM PROPERTY WHERE name = ?";
                inserts = [ args.name ];
                new Promise(function(resolve, reject) {
                    con.query(sql, inserts, function(err, result) {
                        if(err) {
                            con.release();
                            reject(err);
                            return;
                        }
                        resolve(JSON.parse(JSON.stringify(result))[0].property_id);
                        return;
                    });
                }).then(function(propid) {
                    if(args.type == "Farm") {
                        // Check if farm animal exists and create it if it doesn't
                        new Promise(function(resolve, reject) {
                            let sql = "SELECT * FROM FARM_ITEM WHERE name = ?";
                            let inserts = [ args.animal ];
                            con.query(sql, inserts, function(err, result) {
                                if(err) {
                                    con.release();
                                    reject(err);
                                    return;
                                }
                                if(typeof result != "undefined" && result.length > 0) {
                                    resolve();
                                    return;
                                }
                                // Animal doesn't exist, create it
                                createFarmItem(args.animal, "Animal").then(function(res) {
                                    resolve(res);
                                }).catch(function(err) {
                                    reject(err);
                                });
                            });
                        }).then(function() {
                            // Link animal with property
                            addFarmItemToProperty(args.animal, propid).then(function() {
                                resolve("Success");
                            }).catch(function(err) {
                                reject(err);
                            });
                        }).catch(function(err) {
                            reject(err);
                        });
                    }
                    // Check that Orchards only grow fruits and nuts
                    else if(args.type == "Orchard" && (args.crop.type == "Vegetable" || args.crop.type == "Flower")) {
                        con.release();
                        reject("Orchards can only grow Fruits and Nuts");
                        return;
                    }
                    // Check that Gardens only grow vegetables and flowers
                    else if(args.type == "Garden" && (args.crop.type == "Fruit" || args.crop.type == "Nut")) {
                        con.release();
                        reject("Gardens can only grow Vegetables and Flowers");
                        return;
                    }
                    // By this point the crop specified is valid for the property specified; create crop and link to property
                    new Promise(function(resolve, reject) {
                        // Check if crop exists
                        let sql = "SELECT * FROM FARM_ITEM WHERE name = ?";
                        let inserts = [ args.crop.name ];
                        con.query(sql, inserts, function(err, result) {
                            con.release();
                            if(err) {
                                con.release();
                                reject(err);
                                return;
                            }
                            if(typeof result != "undefined" && result.length > 0) {
                                resolve();
                                return;
                            }
                            // Crop doesn't exist, create it
                            createFarmItem(args.crop.name, args.crop.type).then(function(res) {
                                resolve(res);
                            }).catch(function(err) {
                                reject(err);
                            });
                        });
                    }).then(function() {
                        // Link crop with property
                        addFarmItemToProperty(args.crop.name, propid).then(function() {
                            resolve("Success");
                        }).catch(function(err) {
                            reject(err);
                        });
                    }).catch(function(err) {
                        reject(err);
                    });
                }).catch(function(err) {
                    reject(err);
                });
            });
        });
    });
}

/**
    Create farm item from name and type
*/
function createFarmItem(name, type) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, con) {
            if(err) {
                con.release();
                reject(err);
                return;
            }
            let sql = "INSERT INTO FARM_ITEM (name, status, type) VALUES (?)";
            let inserts = [
                [ name, 0, type ]
            ];
            con.query(sql, inserts, function(err, result) {
                con.release();
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

/**
    Link farm item and property given the name and id
*/
function addFarmItemToProperty(farmItem, propertyId) {
    return new Promise(function(resolve, reject) {
        pool.getConnection(function(err, con) {
            if(err) {
                con.release();
                reject(err);
                return;
            }
            let sql = "INSERT INTO GROWS_RAISES (property_id, farm_item_name) VALUES (?)";
            let inserts = [
                [ propertyId, farmItem ]
            ];
            con.query(sql, inserts, function(err, result) {
                con.release();
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