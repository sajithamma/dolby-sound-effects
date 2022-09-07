
# Enhance Audio using Dolby SDK
## Register at https://dolby.io/ to get API access

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://github.com/sajithamma)



## Screenshot

![alt Screenshot](/screenshot.gif)

## NPM Package Used

- @dolbyio/dolbyio-rest-apis-client



```javascript

const get_access = async (callback) => {


    const dolbyio = require('@dolbyio/dolbyio-rest-apis-client');

    const at = await dolbyio.authentication.getApiAccessToken(APP_KEY, APP_SECRET);

    //console.log(`Access Token: ${at.access_token}`);

    console.log('Authenticated...');

    callback(at.access_token);


}


```

```javascript

//First parameter is input and second parameter is the output

dolbi_init('./volcano.mp4', './download.mp4');

```

## How to Run


```bash

npm install
node worker.js

```

