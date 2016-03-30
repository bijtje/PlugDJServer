module.exports = function (getMain, data, con, res) {
    return res.ends(getMain().avatars[con.url.substring(con.url.lastIndexOf('/') + 1)]);
}