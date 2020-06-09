<template>
  <section class="section">
    <div class="buttons">
      <!-- TODO: class="button is-link is-light" when bulma 0.9.0 adopted for nuxt/buefy -->
      <button
        v-for="(flagData, flagId) in flagsJson"
        :key="flagId"
        class="button is-rounded is-light level is-mobile"
        style="padding:0 1rem 0 0;"
      >
        <flag-link :flag-id="flagId" :flag-data="flagData" />
      </button>
    </div>
  </section>
</template>
<script>
import FlagLink from '~/components/FlagLink'
import flagJson from '~/static/flags.json'

export default {
  components: {
    FlagLink
  },
  data() {
    return {}
  },
  computed: {
    flagsJson() {
      return flagJson
    }
  }
}
</script>
