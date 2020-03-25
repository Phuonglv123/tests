const {Router} = require('express');
const {google} = require('googleapis');
const User = require('../model/users');
const router = Router();

router.get('/', function (req, res) {
    res.render('home.html', {'title': 'Application Home'})
});

router.get('/create', function (req, res) {
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
    User.findOne({email: req.body.email})
        .then(user => {
            if (user) {
                res.json({msg: "email is does exits"});
            } else {
                return User.findOne({phone: req.body.phone});
            }
        })
        .then(phone => {
            if (phone) {
                res.json({msg: "Phone is does exits "})
            } else {
                const newUser = new User({
                    ...req.body
                });
                newUser.save()
                    .then(async () => {
                        if (!req.user) res.redirect('/auth/login/google')
                        else {
                            const oauth2Client = new google.auth.OAuth2()
                            oauth2Client.setCredentials({
                                'access_token': req.user.accessToken
                            });
                            const drive = google.drive({
                                version: 'v3',
                                auth: oauth2Client
                            });
                            let namefile = req.body.email;
                            const fileMetadata = {
                                'name': namefile + '- pupam.com',
                                'mimeType': 'application/vnd.google-apps.folder'
                            };
                            const result = await drive.drives.create({
                                    resource: fileMetadata,
                                    requestId: namefile + Math.random(),
                                }
                            );
                            if (result.data) {
                                const share = await drive.permissions.create({
                                    fileId: result.data.id,
                                    sendNotificationEmail: true,
                                    supportsAllDrives: true,
                                    resource: {
                                        role: "fileOrganizer",
                                        type: "group",
                                        emailAddress: namefile
                                    }
                                });
                                if (share.data) {
                                    res.render('result.html', {
                                        'title': 'Application Home',
                                        'message': 'Create folder success !'
                                    })
                                } else {
                                    return res.status(400).json({msg: 'server is not found'})
                                }
                            }
                        }
                    })
                    .catch(console.log)
            }
        })
        .catch(e => {
            return res.status(500).json({error: 'server not found'})
        });
});


module.exports = router;

