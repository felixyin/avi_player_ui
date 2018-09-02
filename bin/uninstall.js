var nw = require('node-windows');
var path = require('path');
var Service = nw.Service;

// nw.list(function(svc){
//     console.log(svc);
// },true);

var svc = new Service({
    name: 'Avi Player Background Service',    //服务名称
    description: '专有AVI格式播放器后台服务，作者尹彬，QQ：1052921694', //描述
    script: path.resolve('server.exe')  //nodejs项目要启动的文件路径
});

svc.on('uninstall',function(){
    console.log('Uninstall complete.');
    console.log('The service exists: ',svc.exists);
});

svc.uninstall();

var nodeCmd = require('node-cmd');

nodeCmd.run('regedit /s "C:\\Program Files (x86)\\AVI Player\\setup\\driver.Undo.reg"');

/*
var spawn = require('child_process').spawn;
var run = spawn('node ', ['./bin/www']);

run.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

run.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
});

run.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});*/
