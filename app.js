var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

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
module.exports = app;
// exports.app = app;
// exports.set_avi_folder =set_avi_folder;
