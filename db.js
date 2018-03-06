var mongo = require('mongodb').MongoClient;
var uri = "mongodb://localhost:27017";
var db_name = "BlogServer";
var db = null;

/* Keep a database connection open.
 *
 * This function will create a database connection if not yet connected.
 */
exports.connect = function() {
    return new Promise((resolve, reject) => {
        if (db) {
            resolve(db);
        } else {
            mongo.connect(uri).then(
                (client) => {
                    db = client.db(db_name);
                    resolve(db);
                },
                (err) => {
                    reject(err.message);
                }
            );
        }
    });
}

exports.collection = function(collection_name) {
    return exports.connect().then(db => db.collection(collection_name));
}

exports.close = function() {
    if (db) {
        return db.close()
    }
}

/*
 * var collections = {};
 * exports.collection = function(collection_name) {
 *     return new Promise((resolve, reject) => {
 *         if (collection_name in collections) {
 *             resolve(collections[collection_name]);
 *         } else {
 *             db.collection(collection_name, (error, collection) => {
 *                 if (error) {
 *                     console.log("Error accessing collection: " + error.message);
 *                     reject(error.message);
 *                 } else {
 *                     collections[collection_name] = collection;
 *                     resolve(collection);
 *                 }
 *             });
 *         }
 *     });
 * }
 */
