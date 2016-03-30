var logger = require('./../logger.js');

module.exports = function(getMain, data, con, res) {
    var id = con.url.substring(con.url.lastIndexOf('/') + 1);
    
    if (id === '-3') {
        res.ends([{
            avatarID: 'admin01',
            badge: 'ba1',
            gRole: 5,
            id: -3,
            slug: 'Console',
            joined: Date.now(),
            level: 33,
            sub: true,
            blurb: 'Console',
            username: 'Console',
            silver: true,
            donator: true
        }]);

        return;
    }

    
    var items = getMain().storeSync.filter((store) => {
        return parseInt(store.id) === parseInt(id);
    });
    
    if (items.length === 0) {
        res.ends(['User not found'], 404);
        return;
    }

    var item = items[0];
    
    res.ends([{
        avatarID: item.avatarID,
        badge: item.badge,
        gRole: item.gRole,
        id: item.id,
        slug: item.slug,
        joined: item.joined,
        level: item.level,
        sub: item.sub,
        blurb: item.blurb,
        username: item.username,
        silver: item.silver,
        donator: item.donator
    }]);
}