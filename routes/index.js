var db = require('../db/sqlite');
var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
    // app.app.set('view engine', 'pug');
    // app.set_avi_folder('D:\\avi_player\\14');
    // app.app.use(express.static('D:\\avi_player\\14'));
    res.sendFile('index', {title: 'Express'});
});

router.get('/testSqlite', function (req, res, next) {
    try {
        db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
            console.log(row.id + ": " + row.info);
        });
        res.json({'asdf':'index.html'});
    } catch (err) {
        next(err);
    }
});
/*
/!* GET home page. *!/
router.get('/r', function (req, res, next) {
    // app.app.set('view engine', 'pug');
    app.set_avi_folder('D:\\avi_player\\14');
    // app.app.use(express.static('D:\\avi_player\\14'));
    res.render('index', {title: 'Express'});
});
*/


module.exports = router;
