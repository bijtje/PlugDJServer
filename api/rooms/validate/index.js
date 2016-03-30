var logger = require('./../../logger.js');

module.exports = function (getMain, data, con, res) {
    var slugs = getMain().rooms.map((room) => {return room.slug});
    var slug = con.url.substring(con.url.lastIndexOf('/') + 1);
    
    while (slugs.contains(slug)) {
        if (!(slug.contains("-")))
            slug += "-";
        slug += Math.getRandom(0, 9).toString();
    }
    
    res.ends([{slug: slug}]);
}