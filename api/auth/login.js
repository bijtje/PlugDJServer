var logger = require('./../logger.js');
var userstore = require('./../../userstore.js');

module.exports = function (getMain, data, con, res) {
    if (userstore.isValid(data.email, data.password)) {
        con.session.getRooms().forEach((room) => {
            room.updateGuestCount(false, con.session);
        });
        getMain().login(con.session, data.email, () => {
            res.ends(['Logged in!']);
        });
    } else {
        res.ends(['Bad username/password combination'], 403, ["Unauthorized"]);
    }
}