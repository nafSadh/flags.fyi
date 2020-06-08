<template>
  <section class="section">
    <div v-if="hasFlagSvg" class="box has-background-light">
      <div class="card-image">
        <figure class="image">
          <img :src="require('~/assets/export/' + `${flagSvg}`)" />
        </figure>
      </div>
    </div>
    <h1 class="title ">{{ title }}</h1>
  </section>
</template>
<script>
import _ from 'lodash'
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
      return this.usedAs + ' of ' + this.titleCase(this.flagId)
    },
    usedAs() {
      if (this.flagData.use) {
        return this.titleCase(this.flagData.use)
      }
      return 'Flag'
    }
  },
  methods: {
    titleCase(str) {
      if (str.length < 3) {
        return _.toUpper(str)
      }
      return _.words(str)
        .map(_.upperFirst)
        .join(' ')
    }
  }
}
</script>
