const {Router} = require('express')
const passport = require('passport')
const {google} = require('googleapis')
const KEYS = require('../configs/keys');
const async = require("async");


const router = Router()

router.get('/', function (req, res) {
    res.render('home.html', {'title': 'Application Home'})
})

router.get('/dashboard', function (req, res) {

    // if not user
    if (typeof req.user == "undefined") res.redirect('/auth/login/google')
    else {

        let parseData = {
            title: 'DASHBOARD',
            googleid: req.user._id,
            name: req.user.name,
            avatar: req.user.pic_url,
            email: req.user.email
        }

        // if redirect with google drive response
        if (req.query.file !== undefined) {

            // successfully upload
            if (req.query.file === "upload") parseData.file = "uploaded";
            else if (req.query.file === "notupload") parseData.file = "notuploaded"
        }

        res.render('dashboard.html', parseData)
    }
})

router.post('/upload', async function (req, res) {

    // not auth
    if (!req.user) res.redirect('/auth/login/google')
    else {
        // auth user

        // config google drive with client token
        const oauth2Client = new google.auth.OAuth2()
        oauth2Client.setCredentials({
            'access_token': req.user.accessToken
        });
        const drive = google.drive({
            version: 'v3',
            auth: oauth2Client
        });
        let namefile = req.body.namefile;
        const fileMetadata = {
            'name': namefile + '- pupam.com',
            'mimeType': 'application/vnd.google-apps.folder'
        };
        const res = await drive.drives.create({
                resource: fileMetadata,
                requestId: namefile + Math.random(),
            }
        );
        if (res.data) {
            const list = await drive.permissions.list({
                fileId: res.data.id
            })
            console.log(list)
            // const share = await drive.permissions.create({
            //     resource: {
            //         'type': 'user',
            //         'role': 'writer',
            //         'emailAddress': 'johnnguyen@pupam.com'
            //     },
            //     fileId: res.data.id,
            //     fields: 'id',
            // })
            // console.log(share)
        }
    }
});


module.exports = router

