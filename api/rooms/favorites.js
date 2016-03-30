var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    if (!(data)) {
        doSearch();
        return;
    }

    if (!(data.id)) {
        res.ends(['Missing id/field'], 400);
        return;
    }

    var favs = con.session.store().favs.push(data.id);

    res.ends([]);

    function doSearch() {
        res.ends(getMain().rooms
            .sort(function (a, b) {
                return a.usersId.length > b.usersId.length;
            })
            .slice(0, 50)
            .map((room) => {
                return room.getSPayload(con.session.store());
            })
            .filter((room) => {
                return room.favorite;
            }));
    }
}

function remove(arr, item) {
    for (var i = arr.length; i--;) {
        if (arr[i] === item) {
            arr.splice(i, 1);
        }
    }
}