<template>
  <div>
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Index of Flags</h1>
        </div>
      </div>
    </section>
    <section class="section main-content container px-0">
      <div class="buttons">
        <button
          v-for="(flagData, flagId) in flagsJson"
          :key="flagId"
          class="button is-rounded is-primary is-light py-0 pl-0 pr-4
                level is-mobile "
        >
          <flag-link :flag-id="flagId" :flag-data="flagData" />
        </button>
      </div>
    </section>
  </div>
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
