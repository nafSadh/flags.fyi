<template>
  <div class="main-content">
    <vexilum :flag-data="flagData" />
    <section class="section container">
      <article class="content">
        <h1 class="title has-text-grey-dark">{{ title }}</h1>
        <div v-if="colors.length > 0">
          <h3>Colors</h3>
          <b-table :data="colors" :columns="colorColumns"></b-table>
        </div>
        <h3>JSON View</h3>
        <no-ssr>
          <json-view :data="flagData" />
        </no-ssr>
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
    return {
      colorColumns: [{ field: 'color' }, { field: 'hex', label: 'hex' }]
    }
  },
  computed: {
    flagId() {
      return this.$route.params.flagId
    },
    idPrefix() {
      return _.split(this.flagId, '-')[0]
    },
    idSuffix() {
      return _.split(this.flagId, '-')[0]
    },
    auxData() {
      if (flagJsonAddOns[this.idPrefix]) {
        const auxJsonPath = this.idPrefix + '/flags.json'
        const auxJson = require('~/assets/export/' + auxJsonPath)
        return auxJson[this.flagId] ? auxJson[this.flagId] : {}
      }
      return {}
    },
    flagData() {
      return _.merge(flagJson[this.flagId], this.auxData)
    },
    colors() {
      return this.flagData.colors ? this.flagData.colors : []
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
