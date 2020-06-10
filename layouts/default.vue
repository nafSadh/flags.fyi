<template>
  <div>
    <nav
      class="navbar header has-shadow is-light"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="container">
        <div class="navbar-brand">
          <a class="navbar-item has-text-primary" href="/">
            <img
              src="~assets/logo/flagstaff-grid-sm.svg"
              alt="flags.fyi"
              height="32"
            />&nbsp;
            <b class="">Flags.fyi</b>
          </a>
          <div class="navbar-burger">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div class="navbar-menu">
          <div class="navbar-end">
            <nuxt-link class="navbar-item" to="/flagIndex">
              Index of Flags
            </nuxt-link>
          </div>
        </div>
      </div>
    </nav>

    <section class="main-content container">
      <nuxt />
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>
