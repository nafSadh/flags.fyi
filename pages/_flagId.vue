<template>
  <section class="section">
    <h1 class="title">{{ title }}</h1>
    <img v-if="hasFlagImg" :src="require('~/assets/export/' + `${flagImg}`)" />
  </section>
</template>
<script>
import flagJson from '~/static/flags.json'
export default {
  components: {},
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
    hasFlagImg() {
      return !!this.flagData.svg
    },
    flagImg() {
      if (this.flagData.svg) {
        return this.flagData.svg
      }
      return ''
    },
    title() {
      if (this.flagData.title) {
        return this.flagData.title
      }
      return 'Flag of ' + this.capitalize(this.flagId)
    }
  },
  methods: {
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }
  }
}
</script>
