<template>
  <div class="home-page">
    <div class="banner">
      <div class="container">
        <h1 class="logo-font">conduit</h1>
        <p>A place to share your knowledge.</p>
      </div>
    </div>

    <div class="container page">
      <div class="row">
        <div class="col-md-9">
          <div class="feed-toggle">
            <ul class="nav nav-pills outline-active">
              <li class="nav-item" v-if="user">
                <nuxt-link
                  :to="{
                    name: 'home',
                    query: {
                      tab: 'your_feed'
                    }
                  }"
                  class="nav-link"
                  :class="{
                    active: tab === 'your_feed'
                  }"
                  exact
                >Your Feed</nuxt-link>
              </li>
              <li class="nav-item">
                <nuxt-link
                  class="nav-link"
                  :class="{
                    active: tab === 'global_feed'
                  }"
                  :to="{
                    name: 'home',
                    query: {
                      tab: 'global_feed'
                    }
                  }"
                  exact
                >Global Feed</nuxt-link>
              </li>
              <li class="nav-item" v-if="tag">
                <nuxt-link
                  class="nav-link"
                  :class="{
                    active: tab === 'tag'
                  }"
                  :to="{
                    name: 'home',
                    query: {
                      tab: 'tag',
                      tag
                    }
                  }"
                  exact
                >#{{ tag }}</nuxt-link>
              </li>
            </ul>
          </div>

          <div class="article-preview" v-for="article in articles" :key="article.slug">
            <div class="article-meta">
              <nuxt-link
                :to="{
                  name: 'profile',
                  params: {
                    username: article.author.username
                  }
                }"
              >
                <img :src="article.author.image" />
              </nuxt-link>
              <div class="info">
                <nuxt-link
                  class="author"
                  :to="{
                    name: 'profile',
                    params: {
                      username: article.author.username
                    }
                  }"
                >{{ article.author.username }}</nuxt-link>
                <span class="date">{{ article.createdAt | date('MMM DD, YYYY') }}</span>
              </div>
              <button
                class="btn btn-outline-primary btn-sm pull-xs-right"
                :class="{
                  active: article.favorited
                }"
                :disabled="article.favoritedDisabled"
                @click="onFavorite(article)"
              >
                <i class="ion-heart"></i>
                {{ article.favoritesCount }}
              </button>
            </div>
            <nuxt-link
              :to="{
                name: 'article',
                params: {
                  slug: article.slug
                }
              }"
              class="preview-link"
            >
              <h1>{{ article.title }}</h1>
              <p>{{ article.description }}</p>
              <span>Read more...</span>
            </nuxt-link>
          </div>

          <nav>
            <ul class="pagination">
              <li
                class="page-item"
                :class="{
                  active: item === page
                }"
                v-for="item in totalPage"
                :key="item"
              >
                <nuxt-link
                  :to="{
                    name: 'home',
                    query: {
                      tab,
                      tag,
                      page: item,
                    }
                  }"
                  class="page-link"
                >{{ item }}</nuxt-link>
              </li>
            </ul>
          </nav>
        </div>

        <div class="col-md-3">
          <div class="sidebar">
            <p>Popular Tags</p>

            <div class="tag-list">
              <nuxt-link
                :to="{
                  name: 'home',
                  query: {
                    tag,
                    tab: 'tag'
                  }
                }"
                v-for="tag in tags"
                :key="tag"
                class="tag-pill tag-default"
              >{{ tag }}</nuxt-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { request } from '@/plugins/request'
import { mapState } from "vuex";

export default {
  name: 'Home',

  watchQuery: ['page', 'tag', 'tab'],

  async asyncData({ query, store }) {
    const { tag, tab = 'global_feed' } = query
    const page = parseInt(query.page) || 1
    const limit = 1
    const params = {
      limit,
      tag,
      offset: (page - 1) * limit,
    }

    const articlesUrl = store.state.user && tab === 'your_feed' ? '/api/articles/feed' : '/api/articles'

    const requests = [request.get(articlesUrl, {
      params
    }), request.get('/api/tags')]

    const [articlesRes, tagsRes] = await Promise.all(requests)

    const { articles, articlesCount } = articlesRes.data
    const { tags } = tagsRes.data

    articles.forEach(article => article.favoritedDisabled = false)

    return { articles, articlesCount, limit, page, tags, tag, tab }
  },

  computed: {
    ...mapState(['user']),

    totalPage() {
      return Math.ceil(this.articlesCount / this.limit) || 0
    }
  },

  methods: {
    async onFavorite(article) {
      // 禁用按钮
      article.favoritedDisabled = true

      const { slug, favorited } = article

      const method = favorited ? 'delete' : 'post'

      await request[method](`/api/articles/${slug}/favorite`)

      article.favorited = !favorited
      article.favoritesCount += favorited ? -1 : 1
      article.favoritedDisabled = false
    }
  }
}
</script>
