// 插件

import axios from 'axios'

export const request = axios.create({
  baseURL: 'https://api.realworld.io',
})

// nuxt 通过插件机制，获取上下文对象(query, params, req, store)
// 插件只能是一个函数，通过接收参数的方式来获取上下文对象 context
// 插件导出只能是默认成员
export default ({ store }) => {
  // 请求拦截器
  // 任何请求都经过请求拦截器
  // 可以在请求拦截器做一些公共的业务处理，譬如设置 token
  request.interceptors.request.use(config => {
    // 请求之前会先经过这里
    const { user } = store.state

    if (user && user.token) {
      config.headers.Authorization = `Token ${user.token}`
    }

    // 返回请求配置对象
    return config
  }, error => {
    // 请求失败进入这里（此时请求还没发出）
    return Promise.reject(error)
  })
}
