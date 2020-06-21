<template>
  <div class="main-content">
    <vexilum :flag="flagData.flag" />
    <article class="section container">
      <div class="columns multiline">
        <div class="column">
          <h1 class="title has-text-grey-dark">{{ title }}</h1>
        </div>
        <div v-if="flagData.cs" class="column is-half"></div>
      </div>
      <section class="content">
        <colors-table :colors="flagData.colors" />
        <div class="pt-6">
          <h2 v-if="!flagData.article">Construction</h2>
          <construction-sheet
            :cs="flagData.cs"
            :thumb-style="
              flagData.article
                ? 'is-tablet-192x192 is-pulled-right pt-3'
                : 'is-tablet-256x256 mx-0'
            "
          />
          <vue-markdown v-if="flagData.article" :breaks="!flagData.article">{{
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
import ConstructionSheet from '~/components/ConstructionSheet'
import Vexilum from '~/components/Vexillum'
import flagsJson from '~/static/flags.json'
import flagJsonIncludes from '~/assets/export/include-flags.json'

export default {
  components: {
    CollapseCard,
    ColorsTable,
    ConstructionSheet,
    Vexilum,
    VueMarkdown
  },
  data() {
    return {
      expanded: false
    }
  },
  computed: {
    flagId() {
      return this.$route.params.flagId
    },
    namespace() {
      return flagsJson[this.flagId].ns || _.split(this.flagId, '-')[0]
    },
    namePart() {
      return this.$namePartFromId(this.flagId, this.namespace)
    },
    auxData() {
      if (flagJsonIncludes[this.namespace]) {
        const auxJsonPath = this.namespace + '/flags.json'
        const auxJson = require('~/assets/export/' + auxJsonPath)
        return auxJson[this.flagId] ? auxJson[this.flagId] : {}
      }
      return {}
    },
    flagData() {
      const flagData = flagsJson[this.flagId]
      if (!flagData.flag) {
        flagData.flag = this.$inferFlagSvg(this.namespace, this.namePart)
      }
      return _.merge(flagData, this.auxData)
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
