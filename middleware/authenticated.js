// 未授权路由中间件

export default function ({ store, redirect }) {
  if (!store.state.user) {
    redirect('/login')
  }
}
