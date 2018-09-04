<template>
    <div id="desktop">
        <input ref="excelFile" name="excel" type="file" multiple="multiple"
               accept="application/vnd.ms-excel" style="display: none;"/>
        <audio ref="foundIt" id="FI" src="found_it.mp3" style="display: none;"></audio>
        <audio ref="notFound" id="NF" src="not_found.mp3" style="display: none;"></audio>
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
                <el-form-item label="快进快退步数" :label-width="formLabelWidth">
                    <el-input-number v-model="settings.back_for_ward_time" :max="50" :min="-50" :step="1"
                                     size="mini"></el-input-number>
                    秒
                </el-form-item>
                <el-form-item label="反向查找范围" :label-width="formLabelWidth">
                    <el-input-number v-model="settings.reverse_lookup_time" :max="1200" :min="0" :step="1"
                                     size="mini"></el-input-number>
                    秒
                </el-form-item>
                <el-form-item label="还原上次播放" :label-width="formLabelWidth">
                    <el-switch
                            v-model="settings.is_restore"
                            active-text="还原"
                            inactive-text="不用"
                    ></el-switch>
                </el-form-item>
                <el-form-item label="保留excel数据" :label-width="formLabelWidth">
                    <el-checkbox v-model="settings.is_retain_excel"></el-checkbox>
                    <el-button v-on:click="removeExcelData" type="primary" size="mini" icon="el-icon-delete"
                               style="margin-left: 50px;">立即清除
                    </el-button>
                </el-form-item>
                <el-form-item label="保留avi数据" :label-width="formLabelWidth">
                    <el-checkbox v-model="settings.is_retain_avi"></el-checkbox>
                    <el-button v-on:click="removeAviData" type="primary" size="mini" icon="el-icon-delete"
                               style="margin-left: 50px;">立即清除
                    </el-button>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="centerDialogVisible = false">取 消</el-button>
                <el-button type="primary" v-on:click="saveSettings">保 存</el-button>
            </div>
        </el-dialog>
        <el-container>
            <el-header :style="{height:toolbarHeight}" class="my-toolbar">
                <el-button-group>
                    <el-button :type="play_type" icon="el-icon-caret-right" v-on:click="play">{{play_text}}</el-button>
                    <el-button type="danger" icon="el-icon-circle-close" v-on:click="stop">停止</el-button>
                </el-button-group>
                <el-button-group>
                    <el-button type="primary" icon="el-icon-view" v-on:click="reverse_lookup">查找时间点</el-button>
                </el-button-group>
                <el-button-group>
                    <el-button type="primary" plain icon="el-icon-d-arrow-left" v-on:click="playPre">上一视频</el-button>
                    <el-button type="primary" plain v-on:click="playNext">下一视频<i
                            class="el-icon-d-arrow-right el-icon--right"></i></el-button>
                </el-button-group>
                <el-button-group>
                    <el-button type="warning" plain icon="el-icon-arrow-left" v-on:click="fastBackward">快退</el-button>
                    <el-button type="warning" plain v-on:click="fastForward">快进<i
                            class="el-icon-arrow-right el-icon--right"></i></el-button>
                </el-button-group>
                <el-button-group class="my-volume">
                    <span>音量：</span>
                    <el-slider :show-tooltip="false" v-model="volume" :min="-4000" :max="0"></el-slider>
                </el-button-group>
                <el-button-group>
                    <el-button type="primary" icon="el-icon-upload2" v-on:click="selectAviFolder">导入视频</el-button>
                    <el-button type="primary" icon="el-icon-plus" v-on:click="selectExcelFile">导入时间点</el-button>
                </el-button-group>
                <el-button type="danger" circle icon="el-icon-setting" v-on:click="openSetting"></el-button>
            </el-header>

            <el-container>
                <!--style="background-color: red;"-->
                <div style="margin-top: 10px;">
                    <center>
                        <el-input placeholder="视频搜索" prefix-icon="el-icon-search" v-model="search_avi_value"
                                  clearable style="width: 95%;"></el-input>
                    </center>
                    <el-aside width="220px">
                        <el-table
                                ref="aviTable"
                                :data="filter_avi_data"
                                @current-change="clickAviRow"
                                :height="clientHeight"
                                :row-class-name="calRowStyle"
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
                                    label="视频名称列表"
                            ></el-table-column>
                        </el-table>
                    </el-aside>
                </div>
                <el-container v-bind:style="{ height: mainHeight+ 'px' }">
                    <el-main>
                        <div id="avi_div" style="height: 99%;">
                            <object id="P" name="P" height="100%" type="video/x-ms-wmv" width="100%">
                                <!--<param name="filename" value="000F7C6806DC_20180814102104_0000/Camera0_180814101355.avi"/>-->
                                <!--<param name="filename" value=""/>-->
                                <param name="autostart" value="true"/>
                                <param name="volume" value="0"/>
                                <param name="mute" value="false"/>
                                <param name="loop" value="true"/>
                                <param name="ShowControls" value="false"/>
                                <param name="SendPlayStateChangeEvents" value="true"/>
                                <param name="SendKeyboardEvents" value="true"/>
                                <param name="SendMouseClickEvents" value="true"/>
                                <param name="SendOpenStateChangeEvents" value="true"/>
                                <param name="SendWarningEvents" value="true"/>
                                <param name="EnableContextMenu" value="false"/>
                                <param name="windowlessVideo" value="true"/>
                            </object>
                        </div>
                    </el-main>
                    <!--style="background-color: yellow;"-->
                    <el-footer>
                        <el-row>
                            <el-col :span="21">
                                <el-slider
                                        v-model="processValue"
                                        :format-tooltip="formatTooltip"
                                        :max="maxProcessValue"
                                        v-on:change="processChange"
                                        placement="bottom"
                                >
                                </el-slider>
                            </el-col>
                            <el-col :span="3">
                                <el-tag class="my-tag">{{now_time}}/{{total_time}}</el-tag>
                            </el-col>
                        </el-row>
                    </el-footer>
                </el-container>
                <!--style="background-color: blue;"-->
                <div style="margin-top: 10px;">
                    <center>
                        <el-input placeholder="时间点搜索" prefix-icon="el-icon-search" v-model="search_excel_value"
                                  clearable style="width: 160px;"></el-input>
                    </center>
                    <el-aside width="170px">
                        <el-table
                                ref="excelTable"
                                :data="filter_excel_data"
                                @current-change="clickExcelRow"
                                :height="clientHeight"
                                :row-class-name="calRowStyle"
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
                                    label="时间点列表"
                                    style="cursor: pointer;"
                            ></el-table-column>
                        </el-table>
                    </el-aside>
                </div>
            </el-container>
        </el-container>
    </div>
</template>

<script>
    export default {
        created() {
            let _this = this;

            // 获取浏览器可视区域高度
            let minusHeight = this.toolbarHeight + 48;
            _this.clientHeight = `${document.documentElement.clientHeight}` - minusHeight;         //document.body.clientWidth;
            _this.mainHeight = _this.clientHeight + 68;
            window.onresize = function () {
                _this.clientHeight = `${document.documentElement.clientHeight}` - minusHeight;
                _this.mainHeight = _this.clientHeight + 68;
            };

            // 禁止文本选择
            document.body.onselectstart = document.body.ondrag = function () {
                return false;
            };

            //禁止用F5键
            document.onkeydown = function (ev) {
                ev = window.event || ev;
                let keycode = ev.keyCode || ev.which;
                if (keycode === 116) {
                    // ev.keyCode ? ev.keyCode = 0 : ev.which = 0;
                    // ev.cancelBubble = true;
                    return false;
                }
            };

            // 程序关闭前，保存设置信息
            window.beforeClose = function () {
                if (_this.currentAviRow && P) {
                    _this.settings.last_avi_name = _this.currentAviRow.avi_name;
                    _this.settings.last_end_time = P.currentPosition;
                    _this.saveSettings();
                }
                return true;
            };

            // 初始化数据
            _this.init_data();
        },
        mounted() {
            let _this = this;

            // 播放进度处理
            setInterval(function () {
                _this.processValue = parseInt(P.currentPosition);
                if (P.currentPosition >= _this.maxProcessValue) { // 自动播放下一个 视频
                    // _this.currentAviRow
                    for (let i = 0; i < _this.avi_data.length; i++) {
                        let avi = _this.avi_data[i];
                        if (avi.avi_name === _this.currentAviRow.avi_name) {
                            let idx = i + 1;
                            if (idx >= _this.avi_data.length) {
                                idx = 0;
                            }
                            // _this.currentAviRow = _this.avi_data[idx];
                            // P.FileName = _this.currentAviRow.avi_path;
                            // P.Volume = _this.volume;
                            // _this.$refs.aviTable.setCurrentRow(_this.currentAviRow);
                            _this.m_play(_this.avi_data[idx]);
                            _this.processValue = 0;
                            P.currentPosition = 0;
                            break;
                        }
                    }
                }
            }, 1000);

            // 隐藏原控制按钮
            // P.ShowControls = false;
            // P.volume = 0;
        },
        watch: {
            // 如果 `clientHeight` 发生改变，这个函数就会运行
            clientHeight: function () {
                this.changeFixed(this.clientHeight)
            },
            // 监测音量滑动条变化，设置音量
            volume: function () {
                P.volume = this.volume;
            },
            // 监测进度条右侧的时间
            processValue: function () {
                this.now_time = this.format_time(this.processValue);
            }
        },
        computed: {
            // 视频列表搜索框
            filter_avi_data: function () {
                let _this = this;
                let key = _this.search_avi_value;
                let data = _this.avi_data;
                return data.filter(function (item) {
                    for (let kk in item) {
                        if (item.hasOwnProperty(kk)) {
                            if (item[kk].toString().indexOf(key) !== -1) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
            },
            // 时间点搜索框
            filter_excel_data: function () {
                let _this = this;
                let key = _this.search_excel_value;
                let data = _this.excel_data;
                return data.filter(function (item) {
                    for (let kk in item) {
                        if (item.hasOwnProperty(kk)) {
                            if (item[kk].toString().indexOf(key) !== -1) {
                                return true;
                            }
                        }
                    }
                    return false;
                });
            }
        },
        methods: {
            format_time(t) {
                let _this = this;
                // 进度条右边的视频总时长
                let totalSecond = t;
                let minute = parseInt(totalSecond / 60);
                if (minute < 10) minute = '0' + minute;
                let second = totalSecond % 60;
                if (second < 10) second = '0' + second;
                return minute + ':' + second;
            },
            m_play(aviObj) {
                let _this = this;
                P.FileName = aviObj.avi_path;
                // P.volume = _this.volume;
                _this.currentAviRow = aviObj;
                // _this.$refs.aviTable.setCurrentRow(_this.currentAviRow);
                //高亮
                let ads = _this.avi_data.map(function (ad, edi) {
                    ad.highlight_class = '';
                    if (ad.avi_name === _this.currentAviRow.avi_name) {
                        // _this.$refs.excelTable.setCurrentRow(item);
                        // _this.currentExcelRow = item;
                        ad.highlight_class = 'current-row';
                    }
                    return ad;
                });
                _this.avi_data = ads;

                P.currentPosition = _this.processValue;

                _this.total_time = _this.format_time(_this.currentAviRow.length_second);
            },
            // 初始化数据方法
            init_data() {
                let _this = this;
                _this.$ajax.post('http://localhost:4404/initData')
                    .then(function (res) {
                        // alert(JSON.stringify(res));
                        if (res.data.ok) {
                            // 初始化avi列表
                            _this.avi_data.splice(0);

                            let is_restore = res.data.settings.is_restore;
                            let an = res.data.settings.last_avi_name;
                            let et = res.data.settings.last_end_time;
                            if (is_restore && an && et) {
                                for (let i = 0; i < res.data.aviList.length; i++) {
                                    let aviObj = res.data.aviList[i];
                                    if (aviObj.avi_name === an) { // 恢复上一次播放的地方
                                        _this.processValue = et;
                                        _this.m_play(aviObj);
                                    }
                                    _this.avi_data.push(aviObj);
                                }
                            } else {
                                for (let i = 0; i < res.data.aviList.length; i++) {
                                    let aviObj = res.data.aviList[i];
                                    if (i === 0) { // 从第一个开始播放
                                        _this.m_play(aviObj);
                                    }
                                    _this.avi_data.push(aviObj);
                                }
                            }

                            // 初始化excel列表
                            _this.excel_data.splice(0);
                            for (let k = 0; k < res.data.excelList.length; k++) {
                                let excelObj = res.data.excelList[k];
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
                let _this = this;
                _this.centerDialogVisible = false;
                if (_this.settings.is_fullscreen) {
                    document.getElementById('avi_div').innerHTML = '<object id="P" name="P" height="100%" type="video/x-ms-wmv" width="100%" >\n' +
                        '                            <!--<param name="filename" value="000F7C6806DC_20180814102104_0000/Camera0_180814101355.avi"/>-->\n' +
                        '                            <!--<param name="filename" value=""/>-->\n' +
                        '                            <param name="autostart" value="true"/>\n' +
                        '                            <param name="volume" value="0"/>\n' +
                        '                            <param name="mute" value="false"/>\n' +
                        '                            <param name="loop" value="true"/>\n' +
                        '                            <param name="ShowControls" value="false"/>\n' +
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
                        '                            <param name="volume" value="0"/>\n' +
                        '                            <param name="mute" value="false"/>\n' +
                        '                            <param name="loop" value="true"/>\n' +
                        '                            <param name="ShowControls" value="false"/>\n' +
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
                // P.FileName = _this.currentAviRow.avi_path;
                _this.m_play(_this.currentAviRow);
                // P.Volume = _this.volume;
                // P.currentPosition = _this.processValue;

            },
            // 删除Excel数据，立刻
            removeExcelData() {
                let _this = this;
                this.$ajax.post('http://localhost:4404/removeExcelData')
                    .then(function (res) {
                        // alert(JSON.stringify(res));
                        if (res.data.ok) {
                            _this.excel_data = [];
                            _this.$message({
                                showClose: true,
                                message: '已经清空了时间点数据',
                                type: 'success'
                            });
                        }
                        // this.centerDialogVisible = false;
                    })
                    .catch(function (err) {
                        _this.$message({
                            showClose: true,
                            message: '清理Excel数据时发生错误！',
                            type: 'error'
                        });
                    });
            },
            // 删除Avi数据，立刻
            removeAviData() {
                let _this = this;
                this.$ajax.post('http://localhost:4404/removeAviData')
                    .then(function (res) {
                        // alert(JSON.stringify(res));
                        if (res.data.ok) {
                            _this.avi_data = [];
                            _this.$message({
                                showClose: true,
                                message: '已经清空了Excel导入数据',
                                type: 'success'
                            });
                        }
                        // this.centerDialogVisible = false;
                    })
                    .catch(function (err) {
                        _this.$message({
                            showClose: true,
                            message: '清理Avi数据时发生错误！',
                            type: 'error'
                        });
                    });
            },
            // 播放测试
            play() {
                let _this = this;
                if (_this.play_text === '播放') {
                    // _this.processValue = 0;
                    // P.currentPosition = _this.processValue;
                    _this.play_text = '暂停';
                    _this.play_type = 'warning';
                    P.play();
                } else if (_this.play_text === '暂停') {
                    P.pause();
                    _this.play_text = '播放';
                    _this.play_type = 'primary';
                }
            },
            // 播放
            list_item_play() {
                let _this = this;

                // _this.processValue = 0;
                // P.currentPosition = _this.processValue;
                _this.play_text = '暂停';
                _this.play_type = 'warning';
                P.play();
            },
            // 停止
            stop() {
                let _this = this;
                _this.processValue = 0;
                P.currentPosition = 0;
                P.stop();
                _this.play_text = '播放';
                _this.play_type = 'primary';
            },
            // 根据视频播放时间点，反向查找对应的excel列表，高亮，并自动展开。
            reverse_lookup() {
                let _this = this;
                let cp = P.currentPosition;
                let start_time = this.currentAviRow.start_time;
                _this.$ajax.post('http://localhost:4404/reverseLookup', {
                    currentPosition: cp,
                    reverse_lookup_time: _this.settings.reverse_lookup_time,
                    start_time: start_time
                }).then(function (res) {
                    // alert(JSON.stringify(res));
                    let excel_items = res.data.excel_items;
                    if (res.data.ok && excel_items.length) {
                        // 暂停播放
                        P.pause();
                        _this.play_text = '播放';
                        _this.play_type = 'primary';

                        // 高亮excel列表
                        // _this.highlight_excel_items = res.data.excel_items;
                        let eds = _this.excel_data.map(function (ed, edi) {
                            ed.reverse_highlight_class = '';
                            excel_items.forEach(function (ei, eii) {
                                if (ed.reported_time === ei.reported_time) {
                                    // _this.$refs.excelTable.setCurrentRow(item);
                                    // _this.currentExcelRow = item;
                                    ed.reverse_highlight_class = 'highlight-current-row';
                                }
                            });
                            return ed;
                        });
                        _this.excel_data = eds;

                        FI.play();
                        _this.$message({
                            showClose: true,
                            message: '已找到对应时间点',
                            type: 'success'
                        });

                    } else {
                        _this.excel_data = _this.excel_data.map(function (ed, edi) {
                            ed.reverse_highlight_class = '';
                            return ed;
                        });
                        NF.play();
                        _this.$message({
                            showClose: true,
                            message: '没有找到对应的时间点',
                            type: 'warning'
                        });
                    }
                }).catch(function (err) {
                    _this.$message({
                        showClose: true,
                        message: '系统发生错误',
                        type: 'error'
                    });
                });

            },
            // 上一个视频
            playPre() {
                let _this = this;
                for (let i = 0; i < _this.avi_data.length; i++) {
                    let avi = _this.avi_data[i];
                    if (avi.avi_name === _this.currentAviRow.avi_name) {
                        let idx = i - 1;
                        if (idx < 0) {
                            idx = _this.avi_data.length - 1;
                        }
                        // _this.currentAviRow = _this.avi_data[idx];
                        // P.FileName = _this.currentAviRow.avi_path;
                        // P.Volume = _this.volume;
                        // _this.$refs.aviTable.setCurrentRow(_this.currentAviRow);
                        _this.processValue = 0;
                        _this.m_play(_this.avi_data[idx]);
                        // P.currentPosition = 0;
                        break;
                    }
                }
            },
            // 下一个视频
            playNext() {
                let _this = this;
                for (let i = 0; i < _this.avi_data.length; i++) {
                    let avi = _this.avi_data[i];
                    if (avi.avi_name === _this.currentAviRow.avi_name) {
                        let idx = i + 1;
                        if (idx >= _this.avi_data.length) {
                            idx = 0;
                        }
                        // _this.currentAviRow = _this.avi_data[idx];
                        // P.FileName = _this.currentAviRow.avi_path;
                        // P.Volume = _this.volume;
                        // _this.$refs.aviTable.setCurrentRow(_this.currentAviRow);
                        _this.processValue = 0;
                        _this.m_play(_this.avi_data[idx]);
                        // P.currentPosition = 0;
                        break;
                    }
                }
            },
            // 快进
            fastForward() {
                let _this = this;
                let fft = this.settings.back_for_ward_time;
                _this.processValue += fft;
                P.currentPosition = _this.processValue;
            },
            // 快退
            fastBackward() {
                let _this = this;
                let fft = this.settings.back_for_ward_time;
                let xxx = _this.processValue;
                xxx -= fft;
                // _this.processValue = xx;
                // P.currentPosition = _this.processValue;
                if (xxx < 0) { // 自动播放下一个 视频
                    // _this.currentAviRow
                    for (let i = 0; i < _this.avi_data.length; i++) {
                        let avi = _this.avi_data[i];
                        if (avi.avi_name === _this.currentAviRow.avi_name) {
                            let idx = i - 1;
                            if (idx < 0) {
                                idx = _this.avi_data.length - 1;
                            }
                            // _this.currentAviRow = _this.avi_data[idx];
                            // P.FileName = _this.currentAviRow.avi_path;
                            // P.Volume = _this.volume;
                            // _this.$refs.aviTable.setCurrentRow(_this.currentAviRow);
                            _this.processValue = 0;
                            _this.m_play(_this.avi_data[idx]);
                            // P.currentPosition = 0;
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
                    let t = this.$moment(this.currentAviRow.start_time).add(val, 'seconds');
                    return t.format('YYYY-MM-DD HH:mm:ss');
                } else {
                    return val;
                }
            },
            // 选择 avi 目录
            selectAviFolder() {
                let _this = this;
                let aviJsonStr = window.external.selectFolder();
                // alert(aviJsonStr);
                if (aviJsonStr == '[]') {
                    _this.$message({
                        showClose: true,
                        message: '您选择目录中没有找到avi文件',
                        type: 'error'
                    });
                    return;
                }
                this.$ajax.post('http://localhost:4404/importAvi', {aviJsonStr: aviJsonStr})
                    .then(function (res) {
                        if (res.data.ok) {
                            // let cr = _this.currentAviRow;
                            _this.avi_data.splice(0);
                            for (let i = 0; i < res.data.aviList.length; i++) {
                                let aviObj = res.data.aviList[i];
                                if (i === 0) { // 从第一个开始播放
                                    // P.FileName = aviObj.avi_path;
                                    // P.Volume = _this.volume;
                                    // _this.$refs.aviTable.setCurrentRow(aviObj);
                                    // _this.currentAviRow = aviObj;
                                    _this.m_play(aviObj);
                                }
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
                let _this = this;
                // 切换播放、暂停按钮状态
                _this.list_item_play();
                // _this.currentAviRow = avi;
                // alert(JSON.stringify(avi));
                _this.maxProcessValue = avi.length_second;
                // 播放这个视频
                // P.FileName = avi.avi_path;
                // P.Volume = _this.volume;
                _this.m_play(avi);
                P.currentPosition = 0;


            },

            // 选择excel文件
            selectExcelFile() {
                let _this = this;
                let excelPath = window.external.selectXlsx();
                // alert(aviJsonStr);
                if (!excelPath) {
                    _this.$message({
                        showClose: true,
                        message: '您没有选择时间点excel文件',
                        type: 'warning'
                    });
                    return;
                }
                this.$ajax.post('http://localhost:4404/importExcel', {excelPath: excelPath})
                    .then(function (res) {
                        // alert(JSON.stringify(res));
                        if (res.data.ok) {
                            // let cr = _this.currentAviRow;
                            _this.excel_data.splice(0);
                            for (let i = 0; i < res.data.excelList.length; i++) {
                                let aviObj = res.data.excelList[i];
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
                let _this = this;
                _this.currentExcelRow = excel;

                //高亮
                let eds = _this.excel_data.map(function (ed, edi) {
                    ed.highlight_class = '';
                    if (ed.reported_time === _this.currentExcelRow.reported_time) {
                        // _this.$refs.excelTable.setCurrentRow(item);
                        // _this.currentExcelRow = item;
                        ed.highlight_class = 'current-row';
                    }
                    return ed;
                });
                _this.excel_data = eds;

                // 播放某个视频的某个位置
                // alert(JSON.stringify(excel));
                let reported_time = excel.reported_time;
                _this.$ajax.post('http://localhost:4404/matchAvi', excel)
                    .then(function (res) {
                        if (res.data.ok) {
                            let avi = res.data.avi;
                            // 高亮视频列表
                            _this.avi_data.forEach(function (item, idx) {
                                if (item.avi_name === avi.avi_name) {

                                    P.FileName = item.avi_path;
                                    _this.currentAviRow = item;
                                    _this.maxProcessValue = _this.currentAviRow.length_second;
                                    _this.total_time = _this.format_time(_this.currentAviRow.length_second);
                                    // 跳转位置，处理前置播放时间
                                    P.currentPosition = avi.offset_second - (_this.settings.pre_play_time - 4);
                                    _this.processValue = P.currentPosition - 4;

                                    // 切换播放、暂停按钮状态
                                    _this.list_item_play();
                                }
                            });
                            //高亮
                            let ads = _this.avi_data.map(function (ad, edi) {
                                ad.highlight_class = '';
                                if (ad.avi_name === _this.currentAviRow.avi_name) {
                                    // _this.$refs.excelTable.setCurrentRow(item);
                                    // _this.currentExcelRow = item;
                                    ad.highlight_class = 'current-row';
                                }
                                return ad;
                            });
                            _this.avi_data = ads;

                            // 播放成功提示音
                            FI.play();
                            _this.$message({
                                showClose: true,
                                message: '找到视频了，已跳到相应时间开始播放',
                                type: 'success'
                            });
                        } else { // 没有找到对应的视频
                            // 播放失败提示音
                            NF.play();
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

            // 计算返回一行的样式
            calRowStyle(row, rowIndex) {
                var rhc =  row.row.reverse_highlight_class ? row.row.reverse_highlight_class : '';
                var hc = row.row.highlight_class?row.row.highlight_class:'';
                return [rhc, hc].join(' ');
            },

            // 保存设置
            saveSettings() {
                let _this = this;
                _this.$ajax.post('http://localhost:4404/saveSettings', _this.settings)
                    .then(function (res) {
                        if (res.data.ok) {
                            _this.$message({
                                showClose: true,
                                message: '保存设置成功',
                                type: 'success'
                            });
                        }
                        _this.centerDialogVisible = false;
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

                // 播放按钮控制
                play_text: '暂停',
                play_type: 'warning',

                // 音量
                volume: 0,

                settings: {
                    // 是否允许全屏
                    is_fullscreen: false,
                    // 是否清理excel数据
                    is_retain_excel: false,
                    // 是否清理avi数据
                    is_retain_avi: false
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
                // 进度条右边的视频总时长
                total_time: 15,
                now_time: '00:00',

                // avi列表搜索框的值
                search_avi_value: '',
                // excel列表搜索框的值
                search_excel_value: '',

                // excel列表高亮的行
                highlight_excel_items: [],

                // 高度自动化计算
                toolbarHeight: 33,
                processHeight: 22,
                clientHeight: 400,
                mainHeight: 420,
            }
        }
    }
</script>

<style>
    /* 百分百 高度填充*/
    #desktop {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    /* 工具栏 */
    .my-toolbar {
        padding-top: 4px;
    }

    /* 去掉滚动条 */
    .el-aside {
        overflow: hidden;
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

    /* 声音滑动条 */
    .my-volume {
        width: 150px;
        height: 32px;
        margin-top: 0 !important;
        padding-left: 10px;
        padding-right: 10px;
    }

    .my-volume > span {
        display: inline-block;
        float: left;
        margin-top: 8px;
    }

    .my-volume > .el-slider {
        margin-left: 50px;
        margin-top: 0;
    }

    .my-volume .el-slider__bar {
        background-color: lightblue;
    }

    .my-volume .el-slider__button {
        /*background-color: lightblue;*/
        border-bottom-color: lightblue;
        border-top-color: lightblue;
        border-left-color: lightblue;
        border-right-color: lightblue;
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

    /* 设置对话框 样式  */
    .el-dialog__body {
        margin-right: 35px;
    }

    .el-dialog__wrapper {
        overflow: hidden;
    }

    .el-dialog {
        margin-top: 20px !important;
    }

    /* 列表鼠标样式 */
    .el-table .cell {
        cursor: default;
    }

    /* 进度条右边的总时长 */
    .my-tag {
        margin-top: 5px;
        margin-left: 15px;
    }

    /*设置对话框黑屏*/
    .v-modal {
        opacity: 1 !important;
    }

    /* excel列表高亮class */
    .highlight-current-row {
        color: green !important;
        font-weight: bold;
        /*background-color: #ecf5ff !important;*/
    }

</style>
