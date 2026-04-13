import axios from 'axios';
import { message } from 'ant-design-vue';

const instance = axios.create({
  baseURL: '/api/thor',
  timeout: 10000,
});

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 0) {
      return res.result; // 直接返回业务结果 
    } else {
      message.error(res.message || '系统错误');
      return Promise.reject(new Error(res.message));
    }
  },
  (error) => {
    message.error('网络异常，请检查后端服务');
    return Promise.reject(error);
  }
);

export default instance;