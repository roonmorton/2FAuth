const mysql = require('mysql');
const Promise = require("bluebird");

const poolConnection = mysql.createPool({
    connectionLimit: process.env.DB_CON_LIMIT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA,
    port: process.env.DB_PORT
});

const _parseConditions =
    (conditions) => {
        let query = '';
        let fields = '*';
        if (conditions) {
            if (conditions.fields)
                fields = conditions.fields;
            if (conditions.where)
                query += " WHERE " + conditions.where;
            if (conditions.group) {
                query += " GROUP BY " + conditions.group;
                if (conditions.groupDESC)
                    query += " DESC";
            }
            if (conditions.having)
                query += " HAVING " + conditions.having;
            if (conditions.order) {
                query += " ORDER BY " + conditions.order;
                if (conditions.orderDESC)
                    query += " DESC";
            }
            if (conditions.limit)
                query += " LIMIT " + conditions.limit;
        }
        return {
            fields: fields,
            query: query
        }
    }

const DBMysql = {

    /*
      data = {
        tableModel: {
        idAttribute: 'id',
        tableName: "TBL"
      },
        obj: {
          id: 0,
          ...
          ...
        }
      }
      */
    save:
        (data) => {
            //var tableName = data.tableName || 'TBL';
            //var idAttribute = data.idAttribute || 'id';
            //var obj = data.obj;
            return new Promise(function (resolve, reject) {
                if (!poolConnection) reject(new Error('mysql: No connection'));
                if (!data.obj.id) {
                    var query = "INSERT INTO " + data.tableModel.tableName + " SET " + poolConnection.escape(data.obj);
                    //console.log(query);
                    poolConnection.query(query, function (err, results, fields) {
                        if (err) reject(err);
                        else if (!results.insertId) reject(new Error('mysql: No row inserted.'));
                        else {
                            data.obj[data.tableModel.idAttribute] = results.insertId;
                            data.obj.info = 'Inserted successfully';
                            resolve(data.obj);
                        }
                    });
                } else {
                    var id = data.obj.id;
                    delete data.obj.id;
                    var query = "UPDATE " + data.tableModel.tableName + " SET " + poolConnection.escape(data.obj) + " WHERE " + data.tableModel.idAttribute + "=" + poolConnection.escape(id);
                    poolConnection.query(query, function (err, results, fields) {
                        if (err) reject(err);
                        else if (!results.changedRows) {
                            data.obj[data.tableModel.idAttribute] = id;
                            data.obj.info = 'Not updated';
                            resolve(data.obj);
                        } else {
                            data.obj[data.tableModel.idAttribute] = id;
                            data.obj.info = 'Updated successfully';
                            resolve(data.obj);
                        }
                    })
                }

            });
        },

    /*
      data = {
        id : 0,
        tableModel: {
        idAttribute: 'id',
        tableName: "TBL"
      },
      
      conditions: {
        where: 'condition',
        group: [atribute],
        groupDEC: true,
        having: 'count(attribute) = 1',
        order: 'attribute',
        orderDEC: true,
        limit: []
      }
      }
    */
    delete:
        (data) => {
            //var id = data.id;
            //var tableName = data.tableName;
            //var idAttribute = data.idAttribute || 'id';
            var parsed = _parseConditions(data.conditions);
            return new Promise(function (resolve, reject) {
                if (!data.id) reject(new Error('mysql-model: No id passed or set'));
                if (!poolConnection) reject(new Error('mysql: No connection'));
                if (data.conditions) {
                    var query = "DELETE FROM " + data.tableModel.tableName + parsed.query;
                } else
                    var query = "DELETE FROM " + data.tableModel.tableName + " WHERE " + data.tableModel.idAttribute + "=" + poolConnection.escape(data.id);
                poolConnection.query(query, function (err, results, fields) {
                    if (err) reject(err);
                    else if (!results.affectedRows) {
                        resolve({
                            [data.idAttribute]: data.id,
                            info: 'Not found'
                        });
                    } //reject(new Error('mysql-model: No rows removed.'));
                    else {
                        if (results.affectedRows > 0) {
                            resolve({
                                [data.idAttribute]: data.id,
                                info: 'Deleted successfully'
                            });
                        }
                    }
                });
            });
        },

    /*
    data = {
      tableModel: {
        idAttribute: 'id',
        tableName: "TBL"
      },
      conditions: {
        where: 'condition',
        group: [atribute],
        groupDEC: true,
        having: 'count(attribute) = 1',
        order: 'attribute',
        orderDEC: true,
        limit: []
      }
    }
    */
    fetch:
        (data) => {
            //var tableName = data.tableName;
            //var conditions = data.conditions;
            var parsed = _parseConditions(data.conditions);
            return new Promise(function (resolve, reject) {
                if (!poolConnection) reject(new Error('mysql-model: No connection'));
                var q = "SELECT " + parsed.fields + " FROM " + data.tableModel.tableName + parsed.query;
                //console.log(q);
                poolConnection.query(q, function (err, result, fields) {
                    if (err || !result) reject(err);
                    else {
                        resolve(result);
                    }
                });
            });
        },

    /*
    data = {
      tableModel: {
        idAttribute: 'id',
        tableName: "TBL"
      }
      params: {
        id: 0,
        fields: ['','']
      }
    }
    */
    find:
        (data) => {
            //var id = data.params.id;
            //var tableName = data.tableName;
            //var idAttribute = data.idAttribute || 'id';
            var fields = data.params.fields || '*';
            return new Promise(function (resolve, reject) {
                if (!data.params.id) reject(new Error('mysql-model: No id passed or set'));
                if (!poolConnection) reject(new Error('mysql-model: No connection'));
                var q = "SELECT " + fields + " FROM " + data.tableModel.tableName + " WHERE " + data.tableModel.idAttribute + "=" + poolConnection.escape(data.params.id);
                poolConnection.query(q, function (err, result, fields) {
                    if (err || !result) reject(err);
                    else {
                        if (result.length == 0) resolve({});
                        else resolve(result[0]);
                    }
                });
            });
        },

    /*
    data = {
      tableModel: {
        idAttribute: 'id',
        tableName: "TBL"
      },
      conditions: {
        where: 'condition',
        group: [atribute],
        groupDEC: true,
        having: 'count(attribute) = 1',
        order: 'attribute',
        orderDEC: true,
        limit: []
      }
    }
    */
    count: (data) => {
        //var tableName = data.tableName || 'Table';
        var parsed = _parseConditions(data.conditions);
        return new Promise(function (resolve, reject) {
            if (!poolConnection) reject(new Error('mysql-model: No connection'));
            var q = "SELECT COUNT(*) counter FROM " + data.tableModel.tableName + parsed.query;
            //console.log(q);
            poolConnection.query(q, function (err, result, fields) {
                if (err || !result) reject(err);
                else resolve(result[0]);
            });
        });
    },

    query:
        (query) => {
            return new Promise(function (resolve, reject) {
                if (!poolConnection) reject(new Error('mysql-model: No connection'));
                //var q = "SELECT COUNT(*) counter FROM " + tableName + parsed.query;
                poolConnection.query(query, function (err, result, fields) {
                   // console.log(fields);
                    if (err || !result) reject(err);
                    else resolve(result);
                });
            });
        }
};

module.exports = DBMysql;