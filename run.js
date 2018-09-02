// #!/usr/bin/env node
var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database(':memory:');
var db = new sqlite3.Database('dist/.d');
// var async = require('async');

// 创建数据库表
db.serialize(function () {

    // async.series([function (cb) {
    db.run("CREATE TABLE IF NOT EXISTS settings ( pre_play_time      INTEGER, fast_forward_time  INTEGER, fast_backward_time INTEGER, last_avi_name      TEXT, last_end_time      INTEGER, is_fullscreen     BOOLEAN, is_restore         BOOLEAN, is_retain_excel   BOOLEAN, is_retain_avi     BOOLEAN );");
    // cb();
    // }, function (cb) {
    db.run("CREATE TABLE IF NOT EXISTS video ( avi_name      TEXT, avi_size      INTEGER, lmi_path      TEXT, avi_path      TEXT, start_time    DATETIME, end_time      DATETIME, length_second INTEGER, upload_time   DATETIME );");
    // cb();
    // }, function (cb) {
    db.run("CREATE TABLE IF NOT EXISTS excel ( device_name   TEXT, longitude     TEXT, latitude      TEXT, imsi          TEXT, reported_time DATETIME, operator      TEXT, localtion     TEXT, upload_time   DATETIME );");
    // cb();
    // }, function (cb) {
    db.all("SELECT * FROM settings", function (err, rows) {
        if (!err && rows && !rows.length) {
            var stmt = db.prepare("INSERT INTO settings VALUES (?,?,?,?,?,?,?,?,?)");
            stmt.run(5, 10, 10, '', 0, false, true, true, true);
            stmt.finalize();
        }
    });
    // cb();
    // }]);

});

// db.close();

// module.exports = db;

// var db = require('../db/sqlite');
var express = require('express');
var fs = require('fs');
var async = require('async');
var xml2js = require('xml2js');
var moment = require('moment');
var xlsx = require('node-xlsx');
var router = express.Router();

moment.locale('zh-cn');

/**
 * 软件主页
 */
router.get('/', function (req, res, next) {
    res.type('html');
    // res.render('index', {title: 'Express'});
    fs.readFile('dist/.tmp', function (err, data) {
        if (err) return console.log(err);
        res.send(data);
    });
});

/**
 * 导入avi视频
 */
router.post('/importAvi', function (req, res, next) {

    var aviJsonList = JSON.parse(req.body.aviJsonStr);
    var now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    async.map(aviJsonList, function (aviObj, callback) {
        // console.log(JSON.stringify(aviObj));
        var parser = new xml2js.Parser();
        fs.readFile(aviObj.lmi_path, function (err, data) {
            parser.parseString(data, function (err, result) {
                var fileInfo = result.LocalManager.Record["0"].File["0"];

                var end_time = fileInfo.EndTimeUTC["0"] + '000';
                var etm = moment(parseInt(end_time));
                aviObj.end_time = etm.format('YYYY-MM-DD HH:mm:ss');

                var start_time = fileInfo.StartTimeUTC["0"] + '000';
                var stm = moment(parseInt(start_time));
                aviObj.start_time = moment(parseInt(start_time)).format('YYYY-MM-DD HH:mm:ss');

                aviObj.length_second = parseInt(etm.diff(stm) / 1000);
                aviObj.avi_size = fileInfo.ActualSize["0"];
                aviObj.avi_name = fileInfo.Name["0"];
                aviObj.upload_time = now;

                callback(null, aviObj);
            });
        });
    }, function (err, results) {
        // console.log('----------------');
        // console.log(results);
        db.serialize(function () {
            async.each(results, function (item, callback) {
                db.all("SELECT count(1) AS count FROM video WHERE avi_name = ?", [item.avi_name], function (err, rows) {
                    if (!err && rows) {
                        var count = rows[0].count;
                        if (count >= 1) {
                            // 更新
                            var stmt = db.prepare("UPDATE video SET avi_size=?, lmi_path=?, avi_path=?, start_time=?, end_time=?, length_second=?, upload_time=? WHERE avi_name=?");
                            stmt.run(item.avi_size, item.lmi_path, item.avi_path, item.start_time, item.end_time, item.length_second, item.upload_time, item.avi_name, callback);
                            stmt.finalize();
                        } else {
                            // 插入
                            var stmt = db.prepare("INSERT INTO video VALUES (?,?,?,?,?,?,?,?)");
                            stmt.run(item.avi_name, item.avi_size, item.lmi_path, item.avi_path, item.start_time, item.end_time, item.length_second, item.upload_time, callback);
                            stmt.finalize();
                        }
                    }
                });
            }, function (err) {
                db.all("SELECT * FROM video ORDER BY start_time ASC ", [], function (err, rows) {
                    if (!err && rows) {
                        return res.json({"ok": true, "aviList": rows});
                    }
                });
            });
        });
    });
});

/**
 * 导入Excel文件
 */
router.post('/importExcel', function (req, res, next) {
    var excelPath = req.body.excelPath;
    var workSheetsFromBuffer = xlsx.parse(fs.readFileSync(excelPath), {cellDates: true});
    // console.log(JSON.stringify(workSheetsFromBuffer));
    var rows = workSheetsFromBuffer["0"].data;
    var header = rows["0"];
    rows.shift();
    console.log(JSON.stringify(header));
    console.log(JSON.stringify(rows));
    var now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

    db.serialize(function () {
        async.each(rows, function (item, callback) {
            console.log(item[4]);
            item[4] = moment(new Date(item[4] + '')).format('YYYY-MM-DD HH:mm:ss');
            db.all("SELECT count(1) AS count FROM excel WHERE reported_time = ?", [item[4]], function (err, rows) {
                if (!err && rows) {
                    var count = rows[0].count;
                    if (count >= 1) {
                        // 更新
                        var stmt = db.prepare("UPDATE excel SET device_name=?, longitude=?, latitude=?, imsi=?, operator=?, localtion=?, upload_time=?  WHERE reported_time=?");
                        stmt.run(item[0], item[1], item[2], item[3], item[5], item[6], now, item[4], callback);
                        stmt.finalize();
                    } else {
                        // 插入
                        var stmt = db.prepare("INSERT INTO excel VALUES (?,?,?,?,?,?,?,?)");
                        stmt.run(item[0], item[1], item[2], item[3], item[4], item[5], item[6], now, callback);
                        stmt.finalize();
                    }
                }
            });
        }, function (err) {
            db.all("SELECT * FROM excel ORDER BY reported_time ASC ", [], function (err, rows) {
                if (!err && rows) {
                    res.json({"ok": true, "excelList": rows});
                }
            });
        });
    });
});

/**
 * 软件启动加载数据
 */
router.post('/initData', function (req, res, next) {
    db.serialize(function () {
        async.waterfall([function (cb) {
            db.all("SELECT * FROM settings", [], function (err, rows) {
                if (!err && rows) {
                    var row = rows[0];
                    row.is_fullscreen = !!row.is_fullscreen;
                    row.is_restore = !!row.is_restore;
                    row.is_retain_excel = !!row.is_retain_excel;
                    row.is_retain_avi = !!row.is_retain_avi;
                    cb(null, {settings: row});
                }
            })
        }, function (allData, cb) {
            if (allData.settings.is_retain_avi) {
                db.all("SELECT * FROM video ORDER BY start_time ASC ", [], function (err, rows) {
                    if (!err && rows) {
                        allData.aviList = rows;
                        cb(null, allData);
                    }
                });
            } else { // 不保留avi 数据
                db.run("DELETE FROM video WHERE 1=1");
                allData.aviList = [];
                cb(null, allData);
            }
        }, function (allData, cb) {
            if (allData.settings.is_retain_excel) {
                db.all("SELECT * FROM excel ORDER BY reported_time ASC ", [], function (err, rows) {
                    if (!err && rows) {
                        allData.excelList = rows;
                        cb(null, allData);
                    }
                });
            } else { //不保留excel数据
                db.run("DELETE FROM excel WHERE 1=1");
                allData.excelList = [];
                cb(null, allData);
            }
        }], function (err, allData) {
            if (!err && allData) {
                allData.ok = true;
                // console.log(allData);
                res.json(allData);
            }
        });
    });

});

/**
 * 匹配avi和计算偏移位置
 */
router.post('/matchAvi', function (req, res, next) {
    var reported_time = req.body.reported_time;
    // console.log(reported_time);
    db.serialize(function () {
        db.all("SELECT * FROM video WHERE start_time < ? AND end_time > ?", [reported_time, reported_time], function (err, rows) {
            if (!err && rows && rows.length) {
                var avi = rows[0];
                var m1 = moment(new Date(avi.start_time + ''), 'YYYY-MM-DD HH:mm:ss'),
                    m2 = moment(new Date(reported_time), 'YYYY-MM-DD HH:mm:ss'),
                    du = moment.duration(m2 - m1, 'ms');
                avi.offset_second = du / 1000;
                res.json({"ok": true, "avi": avi});
            } else {
                res.json({"ok": false, "avi": ''});
            }
        });
    });
});


/**
 * 保存设置
 */
router.post('/saveSettings', function (req, res, next) {
    var s = req.body;
    db.serialize(function () {
        var stmt = db.prepare("UPDATE settings SET pre_play_time = ?, fast_forward_time  = ?, fast_backward_time = ?, last_avi_name = ?, last_end_time = ?, is_fullscreen = ?, is_restore = ?, is_retain_excel  = ?, is_retain_avi = ? WHERE `rowid` = 1");
        stmt.run(s.pre_play_time, s.fast_forward_time, s.fast_backward_time, s.last_avi_name,
            s.last_end_time, s.is_fullscreen, s.is_restore, s.is_retain_excel, s.is_retain_avi, function (err) {
                res.json({"ok": !err, "settings": s});
            });
        stmt.finalize();
    });
});

/**
 * 立即删除Excel数据
 */
router.post('/removeExcelData', function (req, res, next) {
    db.serialize(function () {
        db.run("DELETE FROM excel WHERE 1=1", function (err) {
            res.json({"ok": !err, "excelList": []});
        });
    });
});

/**
 * 立即删除Avi数据
 */
router.post('/removeAviData', function (req, res, next) {
    db.serialize(function () {
        db.run("DELETE FROM video WHERE 1=1", function (err) {
            res.json({"ok": !err, "aviList": []});
        });
    });
});

router.get('/avi', function (req, res, next) {
    file = "D:\\avi_player\\14\\000F7C6806DC_20180814102104_0000\\Camera0_180814101355.avi";
    var fileName = "Camera0_180814101355.avi";
    res.setHeader('Content-disposition', 'attachment; filename=' + fileName + '');
    res.setHeader('Content-Type', 'video/x-ms-wmv');
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
    // res.end();
});

router.get('/testSqlite', function (req, res, next) {
    try {
        db.each("SELECT rowid AS id, info FROM lorem", function (err, row) {
            console.log(row.id + ": " + row.info);
        });
        res.json({'asdf': 'index.html'});
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




/**
 * Module dependencies.
 */
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = router;

var app = express();


//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1');
    // res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

/*function set_avi_folder(avi_path){
    console.log('sdjkfjskldfjskldfjkl')
    app.use(express.static(avi_path));
    // app.use(express.static('D:\\avi_player\\14'));
}*/

// view engine setup
/*app.set('views', path.join(__dirname, 'dist'));
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');*/

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

// FIXME 这里的路径需要读取配置文件，设置界面需提供目录选择，选择后写入配置文件。并重新启动服务。然后刷新界面
// app.use(express.static('D:\\avi_player\\14\\'));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// module.exports = {
//     app: app,
//     set_avi_folder:set_avi_folder
// };
// module.exports = app;
// exports.app = app;
// exports.set_avi_folder =set_avi_folder;


// var app = require('../app');
var debug = require('debug')('avi-player-ui:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '4404');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
