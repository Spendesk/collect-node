const CaptchaSolver = require("../src/captcha-solver");

const captchaSolver = new CaptchaSolver("YXVyZWVhdWJlcnQ6N1YzWmttUzJWZDlGSGhl");
captchaSolver.solveReCaptcha("hello", "http://www.deathbycaptcha.com/user/login").then(response => console.log(response)).catch(e => { console.log(e); })

