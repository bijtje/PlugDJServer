module.exports = function (getMain, data, con, res) {
    var ignores = con.session.store().ignores;
    if (data) {
        var a = getMain().storeSync.filter((user) => {
            return data.id === user.id;
        }).map((obj) => {
            return {username: obj.username, id: obj.id};
        })[0];
        if (!(a)) {
            res.ends(['Userstore for mutee not found'], 400, 'bad request');
            return;
        }
        
        if (!(ignores.contains(a)))
            ignores.push(a);
        
    }
    res.ends(ignores);
}