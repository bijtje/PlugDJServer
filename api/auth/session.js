var logger = require('./../logger.js');
var userstore = require('./../../userstore.js');

module.exports = function (getMain, data, con, res) {
    remove(getMain().sessions, con.session);
    res.ends(['ok']);
}

function remove(arr, item) {
    for (var i = arr.length; i--;)
        if (arr[i] === item)
            arr.splice(i, 1);
}