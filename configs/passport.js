const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const KEYS = require('./keys');
passport.serializeUser((user, done) => {
    let sessionUser = {
        _id: user.googleID,
        accessToken: user.accesstoken,
        name: user.name,
        pic_url: user.pic_url,
        email: user.email
    }

    done(null, sessionUser)
});
passport.deserializeUser((sessionUser, done) => {
    done(null, sessionUser)
});
passport.use(
    new GoogleStrategy(
        {
            clientID: KEYS.googleOauth.clientID,
            clientSecret: KEYS.googleOauth.clientSecret,
            callbackURL: KEYS.googleOauth.callback,
            passReqToCallback: true

        }, (request, accessToken, refreshToken, profile, done) => {
            user = {
                "accesstoken": accessToken,
                'googleID': profile.id,
                'name': profile.displayName,
                'pic_url': profile._json.picture,
                'email': profile._json.email
            };
            done(null, user)
        }
    )
);
