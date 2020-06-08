<template>
  <div>
    <nav
      class="navbar header has-shadow is-primary"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <a class="navbar-item" href="/">
          <img src="~assets/placeholder-logo.svg" alt="Buefy" height="28" />
        </a>

        <div class="navbar-burger">
          <span />
          <span />
          <span />
        </div>
      </div>
    </nav>

    <section class="main-content columns">
      <aside class="column is-2 section">
        <p class="menu-label is-hidden-touch">
          General
        </p>
        <ul class="menu-list">
          <li v-for="(item, key) of items" :key="key">
            <nuxt-link :to="item.to" exact-active-class="is-active">
              <b-icon :icon="item.icon" /> {{ item.title }}
            </nuxt-link>
          </li>
        </ul>
      </aside>

      <div class="container column is-10">
        <nuxt />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { title: 'Home', icon: 'home', to: { name: 'index' } },
        {
          title: 'Bangladesh',
          to: { name: 'flagId', params: { flagId: 'bangladesh' } }
        },
        {
          title: 'Bangladesh Navy',
          to: { name: 'flagId', params: { flagId: 'bangladesh-navy' } }
        },
        {
          title: 'UK',
          to: { name: 'flagId', params: { flagId: 'uk' } }
        },
        {
          title: 'US',
          to: { name: 'flagId', params: { flagId: 'us' } }
        }
      ]
    }
  }
}
</script>
