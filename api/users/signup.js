var logger  = require('./../logger.js'),
    userman = require('./../../userstore.js');

module.exports = function (getMain, data, con, res) {
    if (!(data.email && data.password && data.username)) {
        res.ends(['Missing data'], 400, 'bad request');
        return;
    }

    if (data.email.contains("..") || data.email.contains("/")){
        res.ends(['no'], 403, 'no');
        return;
    }

    var usernameCheck = getMain().getSTO().map((obj) => {return obj.name}).contains(data.username);
    var emailCheck = getMain().getSTO().map((obj) => {return obj.email}).contains(data.email);
    
    if (usernameCheck) {
        res.ends(['Username in use'], 400, 'bad request');
        return;
    }
    
    if (emailCheck) {
        res.ends(['Email in use'], 400, 'bad request');
        return;
    }
    
    if (userman.createUser(data.email, data.username, data.password)) {
        res.ends(['User manager said no... reused username?'], 500, "Internal Server Error");
        return;
    }
    
    getMain().login(con.session, data.email, () => {
        res.ends(['Account created']);
    });
}