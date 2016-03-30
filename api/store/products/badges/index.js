module.exports = function (getMain, data, con, res) {
    return res.ends(getMain().badges.filter((obj) => {
        return obj.category === con.url.substring(con.url.lastIndexOf('/') + 1).replace('b-', '');
    }));
}
