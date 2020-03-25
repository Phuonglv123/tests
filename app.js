const express = require('express');
const homeRouter = require('./routes/home');
const authRouter = require('./routes/auth');
const passportConfig = require('./configs/passport');
const passport = require('passport');
const cookieSession = require('cookie-session');
const KEYS = require('./configs/keys');
const nunjucks = require('nunjucks');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');
const config = require('./configs/database');


let app = express();
const port = 3000 || process.env.PORT;
app.listen(port, () => console.log(`server is running on ${port}`));
nunjucks.configure('views', {
    autoescape: true,
    express: app
});
app.use('/static', express.static('public'));
app.use(cookieSession({
    keys: [KEYS.session_key]
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(fileUpload());

mongoose.connect(config.mongodbURI, {useNewUrlParser: true})
    .then(() => console.log(" ----- MongoDB starting..."))
    .catch(err => console.log(err));

app.use('', homeRouter);
app.use('/auth', authRouter);
