var db = require('./sqlite');
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
    fs.readFile(__dirname + '/index.html', function (err, data) {
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
 * 反向查找时间点
 */
router.post('/reverseLookup', function (req, res, next) {
    var reverse_lookup_time = req.body.reverse_lookup_time;
    let current_time = moment(new Date(req.body.start_time + '')).add(req.body.currentPosition, 'seconds');
    let begin_time_str = moment(current_time).subtract(reverse_lookup_time, 'seconds').format('YYYY-MM-DD HH:mm:ss');
    let end_time_str = moment(current_time).add(reverse_lookup_time, 'seconds').format('YYYY-MM-DD HH:mm:ss');
    // console.log(begin_time_str, end_time_str);
    db.serialize(function () {
        db.all("SELECT * FROM excel WHERE reported_time < ? AND reported_time > ?", [end_time_str, begin_time_str], function (err, rows) {
            res.json({"ok": !err , "excel_items": rows});
        });
    });
});


/**
 * 保存设置
 */
router.post('/saveSettings', function (req, res, next) {
    var s = req.body;
    db.serialize(function () {
        var stmt = db.prepare("UPDATE settings SET pre_play_time = ?, back_for_ward_time  = ?, last_avi_name = ?, last_end_time = ?, reverse_lookup_time = ?, is_fullscreen = ?, is_restore = ?, is_retain_excel  = ?, is_retain_avi = ? WHERE `rowid` = 1");
        stmt.run(s.pre_play_time, s.back_for_ward_time, s.last_avi_name,
            s.last_end_time, s.reverse_lookup_time, s.is_fullscreen, s.is_restore, s.is_retain_excel, s.is_retain_avi, function (err) {
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


module.exports = router;
