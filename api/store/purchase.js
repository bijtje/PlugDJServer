var logger = require('./../logger.js');

//TODO: cleanup

//TODO: cleanup

//TODO: cleanup

module.exports = function (getMain, data, con, res) {
     if (!(data)) {
         res.ends(['Use PUT'], 405, 'Bad request method');
         return;
     }
    
    var id = data.id;
    var session = con.session;
    var store = session.store();
    
    for(badge of getMain().badges){
        if (badge.id === id) {
            if (badge.pp < store.pp) {
                store.pp -= badge.pp;
                store.badges.list.push(badge);
                res.ends([avatar]);
                return;
            } else {
                res.ends(['Not enough pp'], 402, 'no funds');
                return;
            }
        }
    }
    
    var av = getMain().avatars;
    for (key of Object.keys(av)) {
        for (avatar of av[key]) {
            if (avatar.product_id === id) {
                if (avatar.pp < store.pp) {
                    store.pp -= avatar.pp;
                    store.avatars.list.push(avatar);
                    res.ends([avatar]);
                    return;
                } else {
                    res.ends(['Not enough pp'], 402, 'no funds');
                    return;
                }
            }
        }
    }
     res.ends(['Not found 404'], 404, 'Not found');
}