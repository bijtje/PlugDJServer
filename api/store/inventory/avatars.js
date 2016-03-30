module.exports = function (getMain, data, con, res) {
    res.ends(con.session.store().avatars.list);
}