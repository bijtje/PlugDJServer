require("./JSPrototypes.js");

const util = require("util"),
      readline = require('readline'),
      logger = require("./logger.js");

var existRequests = 0;

module.exports = function (index, stfu) {
    stfu = !stfu;
    index = index || {};
    
    index.onError = index.onError || function (e) {
        if (stfu)
            logger.warn("Unhandled error %s!", e.stack);    
    };
    
    index.onLaunch = index.onLaunch ||  () => {
        if (stfu)
            logger.warn("Unhandled ready!");    
    };
    
    index.onStopping = index.onStopping ||  () => {
        if (stfu)
            logger.warn("Unhandled shutdown!");
        return true;
    };
    
    index.onConsoleInput = index.onConsoleInput || function (e) {
        if (stfu)
            logger.warn("Unhandled console input %s!", e);    
    };
    
    var readlineInst = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });

    process.on('SIGINT', () => {
        existRequests ++;
        
        if (existRequests > 2) 
            process.exit();
        
        try {
            if (index.onStopping())
                process.exit();
        } catch (e) {
            process.exit();
        }
    });
    
    process.on('uncaughtException', (e) => {
        try { 
            index.onError(e);
        } catch (i)  {
            logger.warn("------ON ERROR FAILED-----");
            logger.warn("----Original Exception:---");
            logger.warn(e.stack);
            logger.warn("-------New Exception:-----");
            logger.warn(i.stack);
            logger.warn("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
            logger.warn("------ON ERROR FAILED-----");
        }
    });
    
    readlineInst.on('line', index.onConsoleInput);

    index.onLaunch();
}