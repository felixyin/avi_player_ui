<template>
    <div id="app">
        <div class="header" :style="{height:toolbarHeight}">
            <div class="row">
                <at-button icon="icon-download">播放</at-button>
                <at-button icon="icon-download" onclick="document.getElementById('inputfile').click();">导入AVI</at-button>
                <at-button icon="icon-download">播放</at-button>
                <at-button icon="icon-download">播放</at-button>
                <at-button icon="icon-user-plus">暂停</at-button>
                <at-button icon="icon-edit"></at-button>
                <at-button type="primary" icon="icon-search"></at-button>
            </div>
            <form action="/importAvi" method="post">
                <input type="file" name="file[]" id="inputfile" multiple webkitdirectory />
            </form>
        </div>
        <div class="content">
            <div class="left">
                <at-table :columns="columns1" :data="data1" border :height="clientHeight"></at-table>
            </div>
            <div class="video">
                <object id="P" name="P" height="100%" type="video/x-ms-wmv" width="100%" onclick="alert(1);">
                    <param name="filename" value="D:\avi_player\Camera0_180807183105.avi"/>
                    <param name="autostart" value="true"/>
                    <param name="loop" value="true"/>
                    <param name="SendPlayStateChangeEvents" value="true">
                    <param name="SendKeyboardEvents" value="true">
                    <param name="SendMouseClickEvents" value="true">
                    <param name="SendOpenStateChangeEvents" value="true">
                    <param name="SendWarningEvents" value="true">
                    <param name="EnableContextMenu" value="false">
                </object>
            </div>
            <div class="right">
                <at-table :columns="columns2" :data="data2" border :height="clientHeight"></at-table>
            </div>
        </div>
        <div class="process" :style="{height:processHeight}">
            <at-slider v-model="processValue" :min="0" :max="480"></at-slider>
        </div>
    </div>
</template>

<script>
    export default {
        mounted() {

            let self = this;
            let minusHeight = this.toolbarHeight + this.processHeight;
            // 获取浏览器可视区域高度
            this.clientHeight = `${document.documentElement.clientHeight}` - minusHeight;         //document.body.clientWidth;
            //console.log(self.clientHeight);
            window.onresize = function () {
                self.clientHeight = `${document.documentElement.clientHeight}` - minusHeight;
            };
            // init2();
            P.ShowControls = false;
        },
        watch: {
            // 如果 `clientHeight` 发生改变，这个函数就会运行
            clientHeight: function () {
                this.changeFixed(this.clientHeight)
            }
        },
        methods: {
            changeFixed(clientHeight) {                        //动态修改样式
                console.log(clientHeight);
                // this.$refs.leftTable.height = h +'px';
                // this.$refs.rightTable.height = h +'px';

            },
        },
        data() {
            return {
                processValue: 60,
                toolbarHeight: 30,
                processHeight: 22,
                clientHeight: '',
                columns2: [
                    {
                        title: '姓名',
                        key: 'name'
                    },
                    {
                        title: '年龄',
                        key: 'age',
                        sortType: 'normal'
                    }
                ],
                data2: [
                    {
                        name: '库里',
                        age: 18,
                    },
                    {
                        name: '詹姆斯',
                        age: 25,
                    },
                    {
                        name: '科比',
                        age: 24,
                    },
                    {
                        name: '杜兰特',
                        age: 22,
                    }
                ],
                columns1: [
                    {
                        title: '姓名',
                        key: 'name'
                    },
                    {
                        title: '地址',
                        key: 'address'
                    }
                ],
                data1: [
                    {
                        name: '库里',
                        address: '深圳市宝安区创业一路'
                    },
                    {
                        name: '詹姆斯',
                        address: '广州市天河区岗顶'
                    },
                    {
                        name: '科比',
                        address: '上海市浦东新区'
                    },
                    {
                        name: '杜兰特',
                        address: '深圳市南山区深南大道'
                    },
                    {
                        name: '威斯布鲁克',
                        address: '北京市朝阳区'
                    },
                    {
                        name: '邓肯',
                        address: '深圳市罗湖区万象城'
                    },
                    {
                        name: '帕克',
                        address: '深圳市福田区中心书城'
                    },
                    {
                        name: '欧文',
                        address: '广州市番禺区大学城'
                    },
                    {
                        name: '托马斯',
                        address: '北京市朝阳区'
                    },
                    {
                        name: '库里',
                        address: '深圳市宝安区创业一路'
                    },
                    {
                        name: '詹姆斯',
                        address: '广州市天河区岗顶'
                    },
                    {
                        name: '科比',
                        address: '上海市浦东新区'
                    },
                    {
                        name: '杜兰特',
                        address: '深圳市南山区深南大道'
                    },
                    {
                        name: '威斯布鲁克',
                        address: '北京市朝阳区'
                    },
                    {
                        name: '邓肯',
                        address: '深圳市罗湖区万象城'
                    },
                    {
                        name: '帕克',
                        address: '深圳市福田区中心书城'
                    },
                    {
                        name: '欧文',
                        address: '广州市番禺区大学城'
                    },
                    {
                        name: '托马斯',
                        address: '北京市朝阳区'
                    }
                ]
            }
        }
    }
</script>

<style>
    #app {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .header {
    }

    .content {
        flex: 1;
        display: flex;
        flex-direction: row;
    }

    .left {
        width: 240px;
    }

    .video {
        flex: 1;
        background-color: blue;
    }

    .right {
        width: 200px;
    }

    .process {
    }

    /*IE10,IE11,IE12*/
    .at-table__body {
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

</style>
