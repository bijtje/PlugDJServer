var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    con.session.room((room) => {
        if (!(room)) {
            res.ends(["Not in a room"], 400, 'bad request');
            return;
        }

        res.ends(room.history.reverse());
    });
}
