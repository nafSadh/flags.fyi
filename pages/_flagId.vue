<template>
  <div class="main-content">
    <vexilum :flag-data="flagData" />
    <article class="section container">
      <h1 class="title has-text-grey-dark">{{ title }}</h1>
      <section class="content">
        <colors-table :colors="flagData.colors" />
        <div v-if="flagData.article" class="py-6">
          <figure v-if="!!flagData.cs" class="image is-256x256 is-pulled-right">
            <img :src="require('~/assets/export/' + `${flagData.cs}`)" />
            <figcaption>Construction sheet</figcaption>
          </figure>
          <vue-markdown :breaks="!flagData.article">{{
            articleMd
          }}</vue-markdown>
        </div>
      </section>
      <collapse-card title="json:data">
        <client-only>
          <json-view :data="flagData" />
        </client-only>
      </collapse-card>
    </article>
  </div>
</template>
<script>
import _ from 'lodash'
import VueMarkdown from 'vue-markdown'
import CollapseCard from '~/components/CollapseCard'
import ColorsTable from '~/components/ColorsTable'
import Vexilum from '~/components/Vexillum'
import flagJson from '~/static/flags.json'
import flagJsonAddOns from '~/assets/export/add-to-flags.json'

export default {
  components: {
    CollapseCard,
    ColorsTable,
    Vexilum,
    VueMarkdown
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
    hasFlagSvg() {
      return !!this.flagData.svg
    },
    flagSvg() {
      if (this.flagData.svg) {
        return this.flagData.svg
      }
      return ''
    },
    name() {
      return this.flagData.name
        ? this.flagData.name
        : this.$titleCase(this.flagId)
    },
    title() {
      if (this.flagData.title) {
        return this.flagData.title
      }
      return this.usedAs + ' of ' + this.name
    },
    usedAs() {
      if (this.flagData.use) {
        return this.$titleCase(this.flagData.use)
      }
      return 'Flag'
    },
    articleMd() {
      if (this.flagData.article) {
        const md = require('~/assets/export/' + this.flagData.article)
        return md.default
      }
      return ''
    }
  }
}
</script>
