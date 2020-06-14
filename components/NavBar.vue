<template>
  <nav
    class="navbar header is-fixed-top is-white"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="container">
      <div class="navbar-brand">
        <a class="navbar-item has-text-primary" href="/">
          <img
            src="~assets/logo/flagstaff-grid-2-sm.svg"
            alt="flags.fyi"
            height="32"
          />&nbsp;
          <b class="">Flags.fyi</b>
        </a>
        <nuxt-link class="navbar-item is-hidden-desktop" to="/flag-index">
          <span class="icon">
            <fa icon="list-ul" />
          </span>
        </nuxt-link>
        <div class="navbar-burger">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div class="navbar-menu">
        <div class="navbar-end">
          <nuxt-link class="navbar-item " to="/flag-index">
            <span class="icon">
              <fa icon="list-ul" />
            </span>
            <span>Index of Flags</span>
          </nuxt-link>
        </div>
      </div>
    </div>
  </nav>
</template>
