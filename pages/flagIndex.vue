<template>
  <section class="section">
    <div class="buttons">
      <!-- TODO: class="button is-link is-light" when bulma 0.9.0 ready for nuxt -->
      <button
        v-for="(flagData, flagId) in flagsJson"
        :key="flagId"
        class="button is-light"
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
