<template>
  <section class="hero is-fullheight has-background-light">
    <div class="hero-body ">
      <div class="container has-text-centered">
        <figure class="image box px-0 py-0 container is-256x256">
          <img src="~/assets/logo/flagstaff-grid.svg" />
        </figure>
        <p class="title">
          Flags.fyi
        </p>
        <button class="button is-primary">
          <nuxt-link class="has-text-white" to="/flagIndex">
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
