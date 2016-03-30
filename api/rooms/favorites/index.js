var logger = require('./../../logger.js');

module.exports = function (getMain, data, con, res) {
    var id;
    if (!(data)) {
        id = parseInt(con.url.substring(con.url.lastIndexOf('/') + 1));
    } else if (!(data.id)) {
        res.ends(['Missing id/field'], 400);
        return;
    } else {
        id = data.id;
    }
    
    var favs = con.session.store().favs;
    
    if (favs.contains(id)) {
        remove(favs, id);
    } else {
        favs.push(id);
    }
    
    res.ends([])
    
}

function remove(arr, item) {
    for (var i = arr.length; i--;) {
        if (arr[i] === item) {
            arr.splice(i, 1);
        }
    }
}
