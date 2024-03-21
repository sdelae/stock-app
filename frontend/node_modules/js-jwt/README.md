# js-jwt

JavaScript library of jwt encoding

- npm (Node.js package manager)

```bash
npm install js-jwt --save
```

### Usage

Modular include:

```javascript
var jwt = require("js-jwt");
jwt.init('SH256','secret-key') //you can init with secrete and without secret-key
var token = jwt.encode({id:1, name: 'john doe'}, 'secret-key') //here you can bas secret-key if you want to encode with different secretKey
...
console.log(token);
```


### List of alg supported

SH256
SH512