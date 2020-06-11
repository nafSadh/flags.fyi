<template>
  <div>
    <section v-if="hasFlagSvg" class="hero is-light is-bold">
      <div class="hero-body">
        <div class="container">
          <figure class="image box px-0 py-0 container">
            <img :src="require('~/assets/export/' + `${flagSvg}`)" />
          </figure>
        </div>
      </div>
    </section>
    <section class="section main-content container">
      <article class="content">
        <h1 class="title ">{{ title }}</h1>
      </article>
    </section>
  </div>
</template>
<script>
import flagJson from '~/static/flags.json'

export default {
  data() {
    return {}
  },
  computed: {
    flagId() {
      return this.$route.params.flagId
    },
    flagData() {
      return flagJson[this.flagId]
    },
    hasFlagSvg() {
      return !!this.flagData.svg
    },
    flagSvg() {
      if (this.flagData.svg) {
        return this.flagData.svg
      }
      return ''
    },
    title() {
      if (this.flagData.title) {
        return this.flagData.title
      }
      return this.usedAs + ' of ' + this.$titleCase(this.flagId)
    },
    usedAs() {
      if (this.flagData.use) {
        return this.$titleCase(this.flagData.use)
      }
      return 'Flag'
    }
  }
}
</script>
