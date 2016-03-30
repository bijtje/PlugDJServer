var logger = require('./../../logger.js');

module.exports = function (getMain, data, con, res) {
    res.ends([{          
        'id': 'Not synced with Plug.DJ!',      
        'item': 'admin02',     
        'pp': 555555555,         
        'cash': 55555555,         
        'timestamp': Date.now(), 
        'type': 'avatar'     
    }]);
}