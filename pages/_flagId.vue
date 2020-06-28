<template>
  <div class="main-content">
    <vexilum :flag="flagData.flag" />
    <article class="section container">
      <div class="columns multiline">
        <div class="column">
          <h1 class="title has-text-grey-dark">{{ title }}</h1>
        </div>
        <div class="column is-narrow">
          <browse-flags-buttons :flag-id="flagId" />
        </div>
      </div>
      <section class="content">
        <div v-if="flagData.colors" class="pb-4">
          <colors-table :colors="flagData.colors" :note="flagData.colorNote" />
        </div>
        <div class="pt-4">
          <h2 v-if="!flagData.article && !flagData.desc && !!flagData.cs">
            Construction
          </h2>
          <h2 v-if="!!flagData.desc && !!flagData.colors">Description</h2>
          <construction-sheet
            :cs="flagData.cs"
            :thumb-style="
              flagData.article
                ? 'is-tablet-192x192 is-pulled-right pt-3'
                : 'is-tablet-256x256 mx-0'
            "
          />
          <vue-markdown v-if="!!flagData.desc">{{
            flagData.desc
          }}</vue-markdown>
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
import BrowseFlagsButtons from '~/components/BrowseFlagsButtons'
import CollapseCard from '~/components/CollapseCard'
import ColorsTable from '~/components/ColorsTable'
import ConstructionSheet from '~/components/ConstructionSheet'
import Vexilum from '~/components/Vexillum'
import flagsJson from '~/static/flags.json'
import flagJsonIncludes from '~/assets/flags/includes.json'

export default {
  components: {
    BrowseFlagsButtons,
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
        const auxJsonPath =
          this.$dirName(this.namespace) + '/' + flagJsonIncludes[this.namespace]
        const auxJson = require('~/assets/flags/' + auxJsonPath)
        return auxJson[this.flagId] ? auxJson[this.flagId] : {}
      }
      return {}
    },
    flagData() {
      let flagData = flagsJson[this.flagId]
      flagData = _.merge(flagData, this.auxData)
      if (!flagData.flag) {
        flagData.flag = this.$inferFlagSvg(this.namespace, this.namePart)
      }
      if (flagData.desc) {
        flagData.desc = this.$arrayText(flagData.desc)
      }
      return flagData
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
      const usedAs = this.$titleCase(this.$parseUse(this.flagData.use).as)
      return usedAs + ' of ' + this.name
    },
    articleMd() {
      if (this.flagData.article) {
        const md = require('~/assets/flags/' + this.flagData.article)
        return md.default
      }
      return ''
    }
  }
}
</script>
