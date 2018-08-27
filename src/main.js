import Vue from 'vue'
import App from './App.vue'
import 'at-ui-style'
import AtUI from 'at-ui'
import axios from 'axios'
import "babel-polyfill";
import moment from 'moment'

import 'element-ui/lib/theme-chalk/index.css';

// Vue.use(ElementUI);
import {
    Container,
    Header,
    Aside,
    Main,
    Footer,
    Form,
    FormItem,
    Input,
    InputNumber,
    ButtonGroup,
    Button,
    Switch,
    Checkbox,
    Table,
    TableColumn,
    Slider,
    Dialog,
    Loading,
    Message,
    MessageBox,
    Notification
} from 'element-ui';

Vue.prototype.$ELEMENT = {size: 'small', zIndex: 3000};

Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Footer);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(ButtonGroup);
Vue.use(Button);
Vue.use(Switch);
Vue.use(Checkbox);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Slider);
Vue.use(Dialog);

Vue.prototype.$loading = Loading.service;
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$notify = Notification;
Vue.prototype.$message = Message;

Vue.prototype.$ajax = axios;
Vue.prototype.$moment = moment;


Vue.filter('dateformat', function (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
    return moment(dataStr).format(pattern)
});


new Vue({
    el: '#app',
    render: h => h(App)
});