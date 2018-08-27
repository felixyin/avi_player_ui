<template>
    <div id="desktop">
        <el-dialog
                title="软件设置"
                :visible.sync="centerDialogVisible"
                width="400px"
                center>
            <el-form :model="form">
                <el-form-item label="播放提前量" :label-width="formLabelWidth">
                    <el-input-number v-model="settings.pre_play_time" :max="50" :min="-50" :step="1"
                                     size="mini"></el-input-number>
                    秒
                </el-form-item>
                <el-form-item label="快进步数" :label-width="formLabelWidth">
                    <el-input-number v-model="settings.fast_forward_time" :max="50" :min="-50" :step="1"
                                     size="mini"></el-input-number>
                    秒
                </el-form-item>
                <el-form-item label="快退步数" :label-width="formLabelWidth">
                    <el-input-number v-model="settings.fast_backward_time" :max="50" :min="-50" :step="1"
                                     size="mini"></el-input-number>
                    秒
                </el-form-item>
                <el-form-item label="是否全屏" :label-width="formLabelWidth">
                    <!--<el-input v-model="form.areg" auto-complete="off"></el-input>-->
                    <el-switch
                            v-model="settings.is_fullscreen"
                            active-text="开启全屏"
                            inactive-text="关闭全屏"
                            v-on:change="switchFullScreen"
                    ></el-switch>
                </el-form-item>
                <el-form-item label="还原上次播放" :label-width="formLabelWidth">
                    <!--<el-input v-model="form.areg" auto-complete="off"></el-input>-->
                    <el-switch
                            v-model="settings.is_restore"
                            active-text="还原"
                            inactive-text="不用"
                            v-on:change="switchFullScreen"
                    ></el-switch>
                </el-form-item>
                <el-form-item label="保留excel数据" :label-width="formLabelWidth">
                    <el-checkbox v-model="settings.is_retain_excel"></el-checkbox>
                    <el-button type="primary" size="mini" icon="el-icon-delete" style="margin-left: 50px;">立即清除
                    </el-button>
                </el-form-item>
                <el-form-item label="保留avi数据" :label-width="formLabelWidth">
                    <el-checkbox v-model="settings.is_retain_avi"></el-checkbox>
                    <el-button type="primary" size="mini" icon="el-icon-delete" style="margin-left: 50px;">立即清除
                    </el-button>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="centerDialogVisible = false">取 消</el-button>
                <el-button type="primary" v-on:click="saveSettings">保 存</el-button>
            </div>
        </el-dialog>
        <el-container>
            <el-header :style="{height:toolbarHeight}">
                <el-button-group>
                    <el-button type="success" icon="el-icon-caret-right" v-on:click="play">播放</el-button>
                    <el-button type="primary" plain icon="el-icon-d-arrow-left" v-on:click="playPre">上一视频</el-button>
                    <el-button type="primary" plain v-on:click="playNext">下一视频<i
                            class="el-icon-d-arrow-right el-icon--right"></i></el-button>
                    <el-button type="warning" plain icon="el-icon-arrow-left" v-on:click="fastBackward">后退</el-button>
                    <el-button type="warning" plain v-on:click="fastForward">前进<i
                            class="el-icon-arrow-right el-icon--right"></i></el-button>

                </el-button-group>
                <el-button-group>
                    <el-button type="primary" icon="el-icon-upload2" v-on:click="selectAviFolder">导入视频</el-button>
                    <input ref="excelFile" name="excel" type="file" multiple="multiple"
                           accept="application/vnd.ms-excel" style="display: none;"/>
                    <el-button type="primary" icon="el-icon-plus" v-on:click="selectExcelFile">导入EXCEL</el-button>
                </el-button-group>
                <el-button type="danger" circle icon="el-icon-setting" v-on:click="openSetting"></el-button>
            </el-header>

            <el-container>
                <!--style="background-color: red;"-->
                <el-aside width="250px" v-bind:style="{ height: clientHeight + 'px' }">
                    <el-table
                            ref="aviTable"
                            :data="avi_data"
                            highlight-current-row
                            @current-change="clickAviRow"
                            :height="clientHeight"
                            style="width: 100%">
                        <el-table-column type="expand">
                            <template slot-scope="props">
                                <el-form label-position="left" inline class="demo-table-expand">
                                    <el-form-item>
                                        <span>AVI视频文件名:<br/>{{ props.row.avi_name }}</span><br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <span>文件大小:<br/>{{ props.row.avi_size }}</span><br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <span>文件路径:<br/>{{ props.row.avi_path }}</span><br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <span>开始时间:<br/>{{ props.row.start_time }}</span><br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <span>结束时间:<br/>{{ props.row.end_time }}</span><br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <span>上传时间:<br/>{{ props.row.upload_time }}</span>
                                    </el-form-item>
                                </el-form>
                            </template>
                        </el-table-column>
                        <!--<el-table-column-->
                        <!--type="index"-->
                        <!--width="40">-->
                        <!--</el-table-column>-->
                        <el-table-column
                                property="avi_name"

                                width="189"
                                style="cursor: pointer;"
                        ></el-table-column>
                    </el-table>
                </el-aside>
                <el-container>
                    <el-main>
                        <div id="avi_div" style="height: 100%;">
                            <object id="P" name="P" height="100%" type="video/x-ms-wmv" width="100%">
                                <!--<param name="filename" value="000F7C6806DC_20180814102104_0000/Camera0_180814101355.avi"/>-->
                                <!--<param name="filename" value=""/>-->
                                <param name="autostart" value="true"/>
                                <param name="loop" value="true"/>
                                <param name="SendPlayStateChangeEvents" value="true">
                                <param name="SendKeyboardEvents" value="true">
                                <param name="SendMouseClickEvents" value="true">
                                <param name="SendOpenStateChangeEvents" value="true">
                                <param name="SendWarningEvents" value="true">
                                <param name="EnableContextMenu" value="false">
                                <param name="windowlessVideo" value="true">
                            </object>
                        </div>
                    </el-main>
                    <!--style="background-color: yellow;"-->
                    <el-footer>
                        <el-slider
                                v-model="processValue"
                                :format-tooltip="formatTooltip"
                                :max="maxProcessValue"
                                v-on:change="processChange"
                                placement="bottom"
                                show-input>
                        </el-slider>
                    </el-footer>
                </el-container>
                <!--style="background-color: blue;"-->
                <el-aside width="250px" v-bind:style="{ height: clientHeight + 'px' }">
                    <el-table
                            ref="excelTable"
                            :data="excel_data"
                            highlight-current-row
                            @current-change="clickExcelRow"
                            :height="clientHeight"
                            style="width: 100%">
                        <el-table-column type="expand">
                            <template slot-scope="props">
                                <el-form label-position="left" inline class="demo-table-expand">
                                    <el-form-item>
                                        <span>设备名称:<br/>{{ props.row.device_name }}</span><br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <span>经度:<br/>{{ props.row.longitude }}</span><br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <span>纬度:<br/>{{ props.row.latitude }}</span><br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <span>IMSI:<br/>{{ props.row.imsi }}</span><br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <span>上报日期:<br/>{{ props.row.reported_time }}</span><br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <div>运营商:<br/>{{ props.row.operator }}</div>
                                        <br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <div>归属地:<br/>{{ props.row.localtion }}</div>
                                        <br/>
                                    </el-form-item>
                                    <el-form-item>
                                        <span>上传日期:<br/>{{ props.row.upload_time }}</span><br/>
                                    </el-form-item>
                                </el-form>
                            </template>
                        </el-table-column>
                        <!--<el-table-column-->
                        <!--type="index"-->
                        <!--width="40">-->
                        <!--</el-table-column>-->
                        <el-table-column
                                property="reported_time"
                                width="189"
                                style="cursor: pointer;"
                        ></el-table-column>
                    </el-table>
                </el-aside>
            </el-container>
        </el-container>
    </div>
</template>

<script>
    export default {
        created() {
            var _this = this;
            _this.init_data();
        },
        mounted() {
            var _this = this;
            let minusHeight = this.toolbarHeight;
            // 获取浏览器可视区域高度
            _this.clientHeight = `${document.documentElement.clientHeight}` - minusHeight;         //document.body.clientWidth;
            //console.log(self.clientHeight);
            window.onresize = function () {
                _this.clientHeight = `${document.documentElement.clientHeight}` - minusHeight;
            };

            setInterval(function () {
                _this.processValue = parseInt(P.currentPosition);
                if (P.currentPosition >= _this.maxProcessValue) { // 自动播放下一个 视频
                    // _this.currentAviRow
                    for (var i = 0; i < _this.avi_data.length; i++) {
                        var avi = _this.avi_data[i];
                        if (avi.avi_name === _this.currentAviRow.avi_name) {
                            var idx = i + 1;
                            if (idx >= _this.avi_data.length) {
                                idx = 0;
                            }
                            _this.currentAviRow = _this.avi_data[idx];
                            P.FileName = _this.currentAviRow.avi_path;
                            _this.$refs.aviTable.setCurrentRow(_this.currentAviRow);
                            _this.processValue = 0;
                            P.currentPosition = 0;
                            break;
                        }
                    }
                }
            }, 1000);

            // 隐藏原控制按钮
            P.ShowControls = false;
        },
        watch: {
            // 如果 `clientHeight` 发生改变，这个函数就会运行
            clientHeight: function () {
                this.changeFixed(this.clientHeight)
            }
        },
        methods: {
            // 初始化数据方法
            init_data() {
                var _this = this;
                _this.$ajax.post('http://localhost:9000/initData')
                    .then(function (res) {
                        // alert(JSON.stringify(res));
                        if (res.data.ok) {
                            // 初始化avi列表
                            _this.avi_data.splice(0);
                            for (var i = 0; i < res.data.aviList.length; i++) {
                                var aviObj = res.data.aviList[i];
                                if (i === 0) { // 从第一个开始播放
                                    P.FileName = aviObj.avi_path;
                                    _this.$refs.aviTable.setCurrentRow(aviObj);
                                    _this.currentAviRow = aviObj;
                                }
                                _this.avi_data.push(aviObj);
                            }
                            // 初始化excel列表
                            _this.excel_data.splice(0);
                            for (var k = 0; k < res.data.excelList.length; k++) {
                                var excelObj = res.data.excelList[k];
                                _this.excel_data.push(excelObj);
                            }
                            // 初始化settings对象
                            _this.settings = res.data.settings;
                        }
                    })
                    .catch(function (err) {
                        _this.$message({
                            showClose: true,
                            message: '系统发生错误',
                            type: 'warning'
                        });
                    });
            },
            setCurrent(row) {
                this.$refs.aviTable.setCurrentRow(row);
                // this.$refs.excelTable.setCurrentRow(row);
            },
            // 打开设置对话框
            openSetting() {
                this.centerDialogVisible = true;
            },
            // 切换全屏模式
            switchFullScreen() {
                var _this = this;
                _this.centerDialogVisible = false;
                if (_this.settings.is_fullscreen) {
                    document.getElementById('avi_div').innerHTML = '<object id="P" name="P" height="100%" type="video/x-ms-wmv" width="100%" >\n' +
                        '                            <!--<param name="filename" value="000F7C6806DC_20180814102104_0000/Camera0_180814101355.avi"/>-->\n' +
                        '                            <!--<param name="filename" value=""/>-->\n' +
                        '                            <param name="autostart" value="true"/>\n' +
                        '                            <param name="loop" value="true"/>\n' +
                        '                            <param name="SendPlayStateChangeEvents" value="true">\n' +
                        '                            <param name="SendKeyboardEvents" value="true">\n' +
                        '                            <param name="SendMouseClickEvents" value="true">\n' +
                        '                            <param name="SendOpenStateChangeEvents" value="true">\n' +
                        '                            <param name="SendWarningEvents" value="true">\n' +
                        '                            <param name="EnableContextMenu" value="false">\n' +
                        '                            <param name="ShowControls" value="false">\n' +
                        '                            <param name="windowlessVideo" value="true">\n' +
                        '                        </object>';
                } else {
                    document.getElementById('avi_div').innerHTML = '<object id="P" name="P" height="100%" type="video/x-ms-wmv" width="100%" >\n' +
                        '                            <!--<param name="filename" value="000F7C6806DC_20180814102104_0000/Camera0_180814101355.avi"/>-->\n' +
                        '                            <!--<param name="filename" value=""/>-->\n' +
                        '                            <param name="autostart" value="true"/>\n' +
                        '                            <param name="loop" value="true"/>\n' +
                        '                            <param name="SendPlayStateChangeEvents" value="true">\n' +
                        '                            <param name="SendKeyboardEvents" value="true">\n' +
                        '                            <param name="SendMouseClickEvents" value="true">\n' +
                        '                            <param name="SendOpenStateChangeEvents" value="true">\n' +
                        '                            <param name="SendWarningEvents" value="true">\n' +
                        '                            <param name="EnableContextMenu" value="false">\n' +
                        '                            <param name="ShowControls" value="false">\n' +
                        '                            <param name="windowlessVideo" value="false">\n' +
                        '                        </object>';
                }
                P.FileName = _this.currentAviRow.avi_path;
                P.currentPosition = _this.processValue;
            },
            // 播放测试
            play() {
                var _this = this;
                _this.processValue = 0;
                P.currentPosition = _this.processValue;
            },
            playPre() {
                var _this = this;
                for (var i = 0; i < _this.avi_data.length; i++) {
                    var avi = _this.avi_data[i];
                    if (avi.avi_name === _this.currentAviRow.avi_name) {
                        var idx = i - 1;
                        if (idx < 0) {
                            idx = _this.avi_data.length - 1;
                        }
                        _this.currentAviRow = _this.avi_data[idx];
                        P.FileName = _this.currentAviRow.avi_path;
                        _this.$refs.aviTable.setCurrentRow(_this.currentAviRow);
                        _this.processValue = 0;
                        P.currentPosition = 0;
                        break;
                    }
                }
            },
            playNext() {
                var _this = this;
                for (var i = 0; i < _this.avi_data.length; i++) {
                    var avi = _this.avi_data[i];
                    if (avi.avi_name === _this.currentAviRow.avi_name) {
                        var idx = i + 1;
                        if (idx >= _this.avi_data.length) {
                            idx = 0;
                        }
                        _this.currentAviRow = _this.avi_data[idx];
                        P.FileName = _this.currentAviRow.avi_path;
                        _this.$refs.aviTable.setCurrentRow(_this.currentAviRow);
                        _this.processValue = 0;
                        P.currentPosition = 0;
                        break;
                    }
                }
            },
            // 快进
            fastForward() {
                var _this = this;
                var fft = this.settings.fast_forward_time;
                _this.processValue += fft;
                P.currentPosition = _this.processValue;
            },
            // 快退
            fastBackward() {
                var _this = this;
                var fft = this.settings.fast_backward_time;
                var xxx = _this.processValue;
                xxx -= fft;
                // _this.processValue = xx;
                // P.currentPosition = _this.processValue;
                if (xxx < 0) { // 自动播放下一个 视频
                    // _this.currentAviRow
                    for (var i = 0; i < _this.avi_data.length; i++) {
                        var avi = _this.avi_data[i];
                        if (avi.avi_name === _this.currentAviRow.avi_name) {
                            var idx = i - 1;
                            if (idx < 0) {
                                idx = _this.avi_data.length - 1;
                            }
                            _this.currentAviRow = _this.avi_data[idx];
                            P.FileName = _this.currentAviRow.avi_path;
                            _this.$refs.aviTable.setCurrentRow(_this.currentAviRow);
                            _this.processValue = 0;
                            P.currentPosition = 0;
                            break;
                        }
                    }
                } else {
                    _this.processValue = xxx;
                    P.currentPosition = _this.processValue;
                }
            },
            // 格式化进度条提示
            formatTooltip(val) {
                if (this.currentAviRow) {
                    var t = this.$moment(this.currentAviRow.start_time).add(val, 'seconds');
                    return t.format('YYYY-MM-DD HH:mm:ss');
                } else {
                    return val;
                }
            },
            // 选择 avi 目录
            selectAviFolder() {
                var _this = this;
                var aviJsonStr = window.external.selectFolder();
                // alert(aviJsonStr);
                if (aviJsonStr == '[]') {
                    _this.$message({
                        showClose: true,
                        message: '您选择目录中没有找到avi文件',
                        type: 'error'
                    });
                    return;
                }
                this.$ajax.post('http://localhost:9000/importAvi', {aviJsonStr: aviJsonStr})
                    .then(function (res) {
                        if (res.data.ok) {
                            // var cr = _this.currentAviRow;
                            _this.avi_data.splice(0);
                            for (var i = 0; i < res.data.aviList.length; i++) {
                                var aviObj = res.data.aviList[i];
                                _this.avi_data.push(aviObj);
                            }
                            // _this.setCurrent(cr);
                        }
                    })
                    .catch(function (err) {
                        _this.$message({
                            showClose: true,
                            message: '您取消了视频的导入',
                            type: 'warning'
                        });
                    });

            },

            // 点击avi列表某一行
            clickAviRow(avi) {
                this.currentAviRow = avi;
                // alert(JSON.stringify(avi));
                this.maxProcessValue = avi.length_second;
                // 播放这个视频
                P.FileName = avi.avi_path;
            },

            // 选择excel文件
            selectExcelFile() {
                var _this = this;
                var excelPath = window.external.selectXlsx();
                // alert(aviJsonStr);
                if (!excelPath) {
                    _this.$message({
                        showClose: true,
                        message: '您没有选择excel文件',
                        type: 'warning'
                    });
                    return;
                }
                this.$ajax.post('http://localhost:9000/importExcel', {excelPath: excelPath})
                    .then(function (res) {
                        // alert(JSON.stringify(res));
                        if (res.data.ok) {
                            // var cr = _this.currentAviRow;
                            _this.excel_data.splice(0);
                            for (var i = 0; i < res.data.excelList.length; i++) {
                                var aviObj = res.data.excelList[i];
                                _this.excel_data.push(aviObj);
                            }
                            // _this.setCurrent(cr);
                        }
                    })
                    .catch(function (err) {
                        alert(JSON.stringify(err));
                        _this.$message({
                            showClose: true,
                            message: '您没有选择任何文件',
                            type: 'warning'
                        });
                    });

            },

            // 点击excel列表某一行
            clickExcelRow(excel) {
                var _this = this;
                this.currentExcelRow = excel;
                // 播放某个视频的某个位置
                // alert(JSON.stringify(excel));
                var reported_time = excel.reported_time;
                this.$ajax.post('http://localhost:9000/matchAvi', excel)
                    .then(function (res) {
                        if (res.data.ok) {
                            var avi = res.data.avi;
                            // 高亮视频列表
                            _this.avi_data.forEach(function (item, idx) {
                                if (item.avi_name == avi.avi_name) {
                                    _this.$refs.aviTable.setCurrentRow(item);
                                    _this.currentAviRow = item;
                                }
                            });

                            // 播放
                            P.FileName = avi.avi_path;
                            // 跳转位置
                            P.currentPosition = avi.offset_second;
                            _this.$message({
                                showClose: true,
                                message: '找到视频了，已跳到相应时间开始播放',
                                type: 'success'
                            });
                        } else { // 没有找到对应的视频
                            _this.$message({
                                showClose: true,
                                message: '没有找到对应的视频',
                                type: 'warning'
                            });
                        }
                    })
                    .catch(function (err) {
                        _this.$message({
                            showClose: true,
                            message: '发生错误',
                            type: 'error'
                        });
                    });

            },

            // 保存设置
            saveSettings() {
                var _this = this;
                _this.$ajax.post('http://localhost:9000/saveSettings', _this.settings)
                    .then(function (res) {
                        alert(JSON.stringify(res));
                        if (res.data.ok) {
                            alert('ok');
                        } else { // 没有找到对应的视频
                            _this.$message({
                                showClose: true,
                                message: '没有找到对应的视频',
                                type: 'warning'
                            });
                        }
                    })
                    .catch(function (err) {
                        _this.$message({
                            showClose: true,
                            message: '发生错误',
                            type: 'error'
                        });
                    });

            },

            // 用户拖动进度条
            processChange(val) {
                P.currentPosition = val;
            },
            changeFixed(clientHeight) {                        //动态修改样式
                console.log(clientHeight);
            },
        },
        data() {
            return {
                // 设置的数据
                centerDialogVisible: false,
                formLabelWidth: '120px',
                form: {
                    name: '',
                    region: '',
                    date1: '',
                    date2: '',
                    delivery: false,
                    type: [],
                    resource: '',
                    desc: ''
                },
                settings: {},
                settings: {
                    // 是否允许全屏
                    is_fullscreen: true,
                    // 是否清理excel数据
                    clear_excel: true,
                    // 是否清理avi数据
                    clear_avi: false
                },
                // avi视频列表的数据
                avi_data: [],
                currentAviRow: null,
                // excel列表的数据
                excel_data: [],
                currentExcelRow: null,
                // 视频进度条
                maxProcessValue: 100,
                processValue: 0,

                // 高度自动化计算
                toolbarHeight: 33,
                processHeight: 22,
                clientHeight: 500,
            }
        }
    }
</script>

<style>
    /* 100% 高度填充*/
    #desktop {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    /*IE10,IE11,IE12 去掉滚动条*/
    .el-table__body-wrapper {
        /*padding-top: 40px;*/
        /*padding-bottom: 40px;*/
        -ms-scroll-chaining: chained;
        -ms-overflow-style: none;
        -ms-content-zooming: zoom;
        -ms-scroll-rails: none;
        -ms-content-zoom-limit-min: 100%;
        -ms-content-zoom-limit-max: 500%;
        -ms-scroll-snap-type: proximity;
        -ms-scroll-snap-points-x: snapList(100%, 200%, 300%, 400%, 500%);
        -ms-overflow-style: none;
        overflow: auto;
    }

    /*.demo-table-expand {*/
    /*font-size: 0;*/
    /*}*/
    /*.demo-table-expand label {*/
    /*width: 90px;*/
    /*color: #99a9bf;*/
    /*}*/
    .demo-table-expand .el-form-item {
        /*margin-left: -50px;*/
        margin-bottom: 0;
        /*width: 50%;*/
    }

    .el-main {
        padding: 10px 0 20px 0;
    }

    .el-slider {
        margin-top: 15px;
    }

    .el-dialog__body {
        margin-right: 35px;
    }
</style>
