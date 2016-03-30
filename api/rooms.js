var logger = require('./logger.js'),
    Room = require('./../room.js');

module.exports = function (getMain, data, con, res) {
    var store = con.session.store();

    if (data)
        doPost();
    else
        doGet();

    function doPost() {
        if (!(data.name)) {
            res.ends(['Missing name field'], 400, 'bad request');
        }

        var slugs = getMain().rooms.map((room) => {
            return room.slug;
        });

        var slug = encodeURIComponent(data.name);

        while (slugs.contains(slug)) {
            if (!(slug.contains("-")))
                slug += "-";
            slug += Math.getRandom(0, 9).toString();
        }
        
        var ids = getMain().rooms.map((room) => {return room.id;});
        var id = 0;
        while (ids.contains(id))
            id ++;

        var room = new Room(getMain, slug);
        room.slug = slug;
        room.name = data.name;
        room.creator = store.name;
        room.id = id;
        room.creatorId = store.id;
        room.knownUsers.push({
            id: store.id,
            role: 5
        });

        getMain().rooms.push(room);
        store.communities.push(slug);

        res.ends([{
            "id": room.id,
            "name": room.name,
            "slug": room.slug
                }]);
    }

    function doGet() {
        var searchFor = con.args.q.toLowerCase() || "plugdjall";
        var limit = con.args.limit || 50;
        var page = (con.args.page || 1) - 1;

        var keyWords = decodeURIComponent(searchFor).split(" ");
        var rooms = getMain().rooms.filter((room) => {
                if (keyWords.length === 0)
                    return true;
                for (word of keyWords)
                    if (room.name.toLowerCase().contains(word) || room.playing.media.title.toLowerCase().contains(word) || word.contains("plugdjall"))
                        return true;
                return false;
            })
            .sort(function (a, b) {
                return a.usersId.length > b.usersId.length;
            })
            .slice(page * limit, page * limit + limit)
            .map((room) => {
                return room.getSPayload(store)
            }).reverse();
        res.ends(rooms);
    }
}