var logger = require('./../logger.js');

module.exports = function (getMain, data, con, res) {
    var session = con.session;
    var store = session.store();
    var id = store.id;
    
    session.room((room) => { 
        if (!(room)) {
            res.ends(['Not in a room'], 200, 'showdash');
            return;
        }
        
        if (!((store.gRole > 1) || (room.getRole(id) > 3))) {
            res.ends(['Not an admin'], 4401, 'Not an admin');
            return;
        }
        
        if (data.description) 
            room.editDescription(data.description, id);
        if (data.name) 
            room.changeName(data.name, id);
        if (data.welcome)
            room.editWelcome(data.welcome, id);
        if (!((typeof data.minChatLevel) === 'number')) 
            room.minChatLevel = data.minChatLevel;
        res.ends([]);
    });
}
