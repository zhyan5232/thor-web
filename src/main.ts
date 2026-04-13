import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/tailwind.css'
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import 'animate.css'; // 加上这行，动画立即生效
const app = createApp(App);
app.use(router);
app.use(Antd);
app.mount('#app');