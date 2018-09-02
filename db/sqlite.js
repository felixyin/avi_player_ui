var sqlite3 = require('sqlite3').verbose();
// var db = new sqlite3.Database(':memory:');
var db = new sqlite3.Database('dist/.d');
// var async = require('async');

// 创建数据库表
db.serialize(function () {

    // async.series([function (cb) {
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      pre_play_time      INTEGER,
      fast_forward_time  INTEGER,
      fast_backward_time INTEGER,
      last_avi_name      TEXT,
      last_end_time      INTEGER,
      is_fullscreen     BOOLEAN,
      is_restore         BOOLEAN,
      is_retain_excel   BOOLEAN,
      is_retain_avi     BOOLEAN
    );`);
    // cb();
    // }, function (cb) {
    db.run(`CREATE TABLE IF NOT EXISTS video (
      avi_name      TEXT,
      avi_size      INTEGER,
      lmi_path      TEXT,
      avi_path      TEXT,
      start_time    DATETIME,
      end_time      DATETIME,
      length_second INTEGER,
      upload_time   DATETIME
    );`);
    // cb();
    // }, function (cb) {
    db.run(`CREATE TABLE IF NOT EXISTS excel (
      device_name   TEXT,
      longitude     TEXT,
      latitude      TEXT,
      imsi          TEXT,
      reported_time DATETIME,
      operator      TEXT,
      localtion     TEXT,
      upload_time   DATETIME
    );`);
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

module.exports = db;