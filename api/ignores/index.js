var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session,
        store = session.store(),
        ignores = store.ignores,
        id = con.url.substring(con.url.lastIndexOf('/') + 1);
    
    var ignore = ignores.filter((ignore) => {
        return ignore.id == id;
    })[0];
    
    if (!(ignore)) {
        res.ends(['Ignore save not found!'], 404, 'Not ignoring user');
        return;
    }
    
    remove(ignores, ignore);
    
    res.ends(ignores);
}

function remove(arr, item) {
    for (var i = arr.length; i--;)
        if (arr[i] === item)
            arr.splice(i, 1);
}