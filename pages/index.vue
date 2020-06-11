<template>
  <section class="hero is-fullheight is-primary is-bold">
    <div class="hero-body ">
      <div class="container has-text-centered">
        <figure class="image box px-0 py-0 container is-256x256">
          <img src="~/assets/logo/flagstaff-grid-2.svg" />
        </figure>
        <p class="title">
          Flags.fyi
        </p>
        <button class="button is-primary is-light">
          <nuxt-link class="has-text-primary" to="/flag-index">
            <span>Goto: Index of Flags</span>
          </nuxt-link>
        </button>
      </div>
    </div>
  </section>
</template>
<script>
export default {
  name: 'HomePage',
  layout: 'vanilla',
  components: {}
}
</script>
