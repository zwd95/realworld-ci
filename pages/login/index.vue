<template>
  <div class="auth-page">
    <div class="container page">
      <div class="row">
        <div class="col-md-6 offset-md-3 col-xs-12">
          <h1 class="text-xs-center">{{ isLogin ? 'Sign in' : 'Sign up' }}</h1>
          <p class="text-xs-center">
            <nuxt-link v-if="!isLogin" to="/login">Have an account?</nuxt-link>

            <nuxt-link v-if="isLogin" to="/register">Need an account?</nuxt-link>
          </p>

          <ul class="error-messages">
            <template v-for="(messages, field) in errors">
              <li v-for="(message, index) in messages" :key="index">{{ field }} {{ message }}</li>
            </template>
          </ul>

          <form @submit.prevent="onSubmit">
            <fieldset class="form-group" v-if="!isLogin">
              <input
                v-model="user.username"
                class="form-control form-control-lg"
                type="text"
                placeholder="Your Name"
                required
              />
            </fieldset>
            <fieldset class="form-group">
              <input
                v-model="user.email"
                class="form-control form-control-lg"
                type="email"
                placeholder="Email"
                required
              />
            </fieldset>
            <fieldset class="form-group">
              <input
                v-model="user.password"
                class="form-control form-control-lg"
                type="password"
                placeholder="Password"
                required
                minlength="6"
              />
            </fieldset>
            <button
              class="btn btn-lg btn-primary pull-xs-right"
            >{{ isLogin ? 'Sign in' : 'Sign up' }}</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { request } from '@/plugins/request'
// 仅在客户端加载 js-cookie 包
const Cookie = process.client ? require('js-cookie') : undefined

export default {
  name: 'Login',
  middleware: 'notAuthenticated',

  data() {
    return {
      user: {
        email: '',
        password: '',
        username: ''
      },

      errors: {}
    }
  },

  computed: {
    isLogin() {
      return this.$route.name === 'login'
    }
  },

  methods: {
    async onSubmit() {
      const url = this.isLogin ? '/api/users/login' : '/api/users'

      try {
        const { data: { user } } = await request.post(url, { user: this.user })

        // 存储用户信息
        this.$store.commit('setUser', user)

        // 为了防止刷新页面数据丢失，需要把数据持久化
        Cookie.set('user', JSON.stringify(user))

        this.$router.push('/')
      } catch (error) {
        this.errors = error.response.data.errors
      }
    }
  }
}
</script>
