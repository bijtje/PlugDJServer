var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    var store = session.store();
    
    if (!(data)) {
        res.ends(['Missing data'], 400, 'bad request');
        return;
    }
    
    session.room((room) => {
        var role = data.roleID;
        var uid = data.userID;
        
        if (!(role < room.getRole(store.id))) {
            res.ends(['Your role < Their wanted role'], 400, 'Your role < Their wanted role');
            return;
        }
        
        var item = room.knownUsers.filter((u) => {
            return u.id === uid;
        })[0];
        
        if (item)
            item.role = role;
        else 
            room.knownUsers.push({role: role, id: uid});
        
        res.ends([]);
    });
}