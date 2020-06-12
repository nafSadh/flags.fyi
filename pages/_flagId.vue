<template>
  <div class="main-content">
    <vexilum :flag-data="flagData" />
    <section class="section container">
      <article class="content">
        <h1 class="title has-text-grey-dark">{{ title }}</h1>
        {{ auxData }}
      </article>
    </section>
  </div>
</template>
<script>
import _ from 'lodash'
import Vexilum from '~/components/Vexillum'
import flagJson from '~/static/flags.json'
import flagJsonAddOns from '~/assets/export/add-to-flags.json'

export default {
  components: {
    Vexilum
  },
  data() {
    return {}
  },
  computed: {
    flagId() {
      return this.$route.params.flagId
    },
    idPrefix() {
      return _.split(this.flagId, '-')[0]
    },
    auxData() {
      const auxJsonPath = this.idPrefix + '/flags.json'
      if (flagJsonAddOns[this.idPrefix]) {
        const auxJson = require('~/assets/export/' + auxJsonPath)
        return auxJson[this.flagId] ? auxJson[this.flagId] : {}
      }
      return {}
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
