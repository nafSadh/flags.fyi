<template>
  <nuxt-link :to="to" class="level-left">
    <span v-if="hasFlagImg" class="level-item">
      <figure class="image is-32x32">
        <img
          :src="require('~/assets/flags/' + `${flagImg}`)"
          :class="flagIconStyle"
          class="image is-32x32 is-rounded object-fit-cover"
        />
      </figure>
    </span>
    <span class="has-text-primary">{{ name }}</span>
  </nuxt-link>
</template>
<script>
import _ from 'lodash'
export default {
  props: {
    flagData: {
      type: Object,
      required: true
    },
    flagId: {
      type: String,
      required: true
    }
  },
  computed: {
    namespace() {
      return this.flagData.ns || _.split(this.flagId, '-')[0]
    },
    namePart() {
      return this.$namePartFromId(this.flagId, this.namespace)
    },
    hasFlagImg() {
      return this.flagData.flag !== 'none'
    },
    flagImg() {
      return this.hasFlagImg
        ? this.flagData.flag ||
            this.$inferFlagSvg(this.namespace, this.namePart)
        : ''
    },
    name() {
      return this.flagData.name
        ? this.flagData.name
        : this.$titleCase(this.flagId)
    },
    to() {
      return {
        name: 'flagId',
        params: {
          flagId: this.flagId
        }
      }
    },
    flagIconStyle() {
      return {
        'object-at-left': !!this.flagData._ && this.flagData._.includes('left')
      }
    }
  }
}
</script>
