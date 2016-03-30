#General

Welcome to the repository for the open source plug.dj (backend) project! If you aren't an advanced user, this isn't for you.

#Legal
This repository contains none of `Plug DJ Inc`'s assets, nor would we want encourage the redistribution of them, to the best of our knowledge. We may tell end users how to download assets, however, said end users are reminded that this code comes with no warranty. All end users are responsible for any damages in any form that may occur, whilst the repository owner or legal owner will not be held responsible, for anything that occurs as a result of the code in this repository. This project as of 29/03/2016 (DD/MM/YYYY) is strictly a research project. This legal portion is subject to change.

#Code
The code is subject to change and messy functions like the room instances will more than likely change alot until they are highly optimized. Currently, this code is designed to load all rooms into memory, then each user as they login, therefore making it inefficient for production on low end servers, however, we don't expect to get that much traffic anyway.

#Installation instructions

- /assets/ - recreate the `/_/static/` structure OR throw everything in to the root directory
- /scripts/ -place all .js files in here and/or recreate the `/_/static/` structure  
- /css/ - place all .css files in here and/or recreate the `/_/static/` structure  
- /pages/ - home.html - the index, room.html - room/dashboard 
- /avatars/ - your scrapped avatars


In-order to get plug.dj working, you will need to patch a few things. 

App.js:

- Replace all instances of `https://cdn.plug.dj` (or stgcdn) with `http://[CDN]`
- Replace all instances of `plug.dj` with `[HOST]`
- Search for `gapi.client.setApiKey` and replace plug.djs api key with `[KEY]`
- Search for `this.firstTime = !0, this.$spotlight` and replace the whole line with `this.firstTime = !0, this.$spotlight = e("<div/>").addClass("spotlight"), this.$avatar = e("<div/>").addClass("avatar"), this.frameWidth = [THEME:FRAMEW], this.frameHeight = [THEME:FRAMEH], this.videoResizeBind = t.bind(this.onVideoResize, this)`
- Search for `return e.background = "http://[CDN]`, replace the `e.background` value to `"http://[CDN]/_/static/images/community/[THEME:BACKGROUND]"` and replace videoframe with `"http://[CDN]/_/static/images/community/[THEME:PLAYER]"`

Avatars.js:
- Change the base_url to `http://[CDN]/out/`

Room.html:

- Replace all instances of `https://cdn.plug.dj` (or stgcdn) with `http://[CDN]`
- Replace all instances of `plug.dj` with `[HOST]`
- Set `_st`'s value to `[DATE/TIME]`
- Set `_gws`'s value to `ws://[SERVER]:[SOCKETPORT]`
- (optionally) Change your CSRF to "Warning: Your library is outdated... this is now cookie based."

Home.html:

- Add the jquery script  in your header block 
- At the bottom of the page insert 

```javascript

    <script>
      $(document).on('ready', function () {
         $('.search button').click();
      });
    </script>
    
```



Now, you want a video player, right?

- Go into the app.js
- [] Search for `window.location.protocol + "//plgyte.appspot.com`
- Replace the `.html` with `<nothing>`
- Go back upto to the step marked as []
- Replace **ALL** instances of `plgyte.appspot.com` with `[HOST]`
- Copypaste the source of `https://plgyte.appspot.com/yt5.html` into `./assets/yt5.html`
- Copypaste the source of `https://plgyte.appspot.com/ytp5.html` into `./assets/ytp5.html`

After all that, go into your config.json, and adjust it to your needs.

|Key   |Value   |
|---|-----|
|sport | The port the websocket server will listen on|
|port | The port for the website|
|key | Your google developers console api key ([help](https://support.google.com/cloud/?hl=en#topic=3340599))|
|host  |The expected domain with a port if not 80 (IE: plug.itsghost.me)|
|cdn | Your CDN URL without the protocol (IE: cdn.itsghost.me:423)|
|server | The expected domain with NO port|
|motd | Message of the day|
|mode | The page to display (./pages/%s.html) whilst the server has a whitelist|
|whitelist | IPS to bypass the mode. NULL if server isn't in maintenance, etc)|
|theme | `./assets/images/community/<ID>.png`| 

...and you're done. All you have to do is run the project:
- `npm install` (first run)
- `node index.js`


#License
See legal. All rights reserved.