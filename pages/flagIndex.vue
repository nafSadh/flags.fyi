<template>
  <section class="section">
    <div class="columns is-multiline">
      <div
        v-for="(flagData, flagId) in flagsJson"
        :key="flagId"
        class="column is-narrow"
      >
        <flag-link :flag-id="flagId" :flag-data="flagData" />
      </div>
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
