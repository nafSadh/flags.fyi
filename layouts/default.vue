<template>
  <div>
    <nav
      class="navbar header has-shadow is-primary"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="container">
        <div class="navbar-brand">
          <a class="navbar-item" href="/">
            <img src="~assets/flagstaff-sm.svg" alt="flags.fyi" height="28" />
            <b>Flags.fyi</b>
          </a>
          <div class="navbar-burger">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div id="navbarBasicExample" class="navbar-menu">
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
