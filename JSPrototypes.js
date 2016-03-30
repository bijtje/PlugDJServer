module.exports = new function() {
    String.prototype.endsWith = function (suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    String.prototype.contains = function (str) {
        return this.indexOf(str) != -1;
    };
    
    Number.prototype.zeroPad = function() {
        return ('0'+this).slice(-2);
    };

    String.prototype.replaceLast = function (find, replace) {
        var index = this.lastIndexOf(find);
        if (index >= 0)
            return this.substring(0, index) + replace + this.substring(index + find.length);
        return this.toString();
    };

    String.prototype.startsWith = function (str) {
        return this.substring(0, str.length) === str;
    };

    String.prototype.middle = function (before, after) {
        return this.split(before)[1].split(after)[0];
    };

    //TODO: non-regex
    String.prototype.before = function (before) {
        return this.split(before)[0];
    };

    //TODO: non-regex
    String.prototype.after = function (before) {
        return this.split(before)[0];
    };

    String.prototype.removeFirstLine = function () {
        return this.replace(this.before("\n") + "\n", "").replace("\r", "");
    };

    String.prototype.replaceAll = function (search, last) {
        return this.split(search).join(last);
    };

    Math.getRandom = function (low, high) {
        if (!(high)) {
            high = low;
            low = 0;
        }
        return Math.floor(Math.random() * (high - low) + low);
    };

    Buffer.prototype.readByte = function (offset) {
        return this.toString("hex").substring(offset * 2, offset * 2 + 2);
    };

    Buffer.prototype.pushByte = function (byte, offset) {
        var asHex = this.toString("hex");
        if (offset) 
            return Buffer(asHex.substring(0, offset * 2) + byte + asHex.substring(offset * 2), "hex");
        return new Buffer(asHex + byte, "hex"); 
        
        //this[offset] = byte;
    };

    Buffer.junkedBuffer = function (length) {
        var buffer = new Buffer(0);
        for (i = 0; i < length; i++) {
            const listOfHexChars = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "A", "B", "C", "D", "E", "F"];
            var a = listOfHexChars[Math.getRandom(listOfHexChars.length)];
            var b = listOfHexChars[Math.getRandom(listOfHexChars.length)];
            var newByte = a + b;
            buffer = buffer.pushByte(newByte);
        }
        return buffer;
    };
    
    Array.prototype.move = function (old_index, new_index) {
        if (new_index >= this.length) {
            var k = new_index - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this; // for testing purposes
    };
    
    Array.prototype.contains = function (obj) {
        var i = this.length;
        while (i--) {
            if (this[i] == obj) {
                return true;
            }
        }
        return false;
    }

    //Last resort
    JSON.asString = (object) => {
        var simpleObject = {};
        for (var prop in object) {
            if (!object.hasOwnProperty(prop)) {
                continue;
            }
            if (typeof (object[prop]) === 'object') {
                simpleObject[prop] = object[prop];
                continue;
            }
            if (typeof (object[prop]) === 'function') {
                continue;
            }
            simpleObject[prop] = object[prop];
        }
        return JSON.stringify(simpleObject);
    };
    
    
    const leg = Date.now;
    
    Date.now = () => {
        var d = new Date,
            format = [d.getFullYear(), 
                       (d.getMonth() + 1).zeroPad() ,
                       d.getDate().zeroPad()].join('-')+' '+
                      [d.getHours().zeroPad(),
                       d.getMinutes().zeroPad(),
                       d.getSeconds().zeroPad()].join(':') +
                       '.000000 UTC';
        return format;
    };
    
    Date.leg_now = leg;
};