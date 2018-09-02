module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: ['run.js'],
                dest: 'server.exe'
            }
           /* buildall: {
                options: {
                    mangle: true,
                    compress: {
                        drop_console: true
                    },
                    report: "min" //输出压缩率,可选值有false(不输出)
                },
                files: [{
                    expand: true,
                    src: 'run.js', //所有js文件
                    ext: '.min.js',
                    dest: 'bin' //输出到此目录下
                }]
            }*/
        }
    });

    // 加载包含 "uglify" 任务的插件。
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // 默认被执行的任务列表。
    grunt.registerTask('min', ['uglify']);

};