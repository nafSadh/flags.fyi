<template>
  <nuxt-link :to="to" class="level-left">
    <span v-if="hasFlagImg" class="level-item">
      <figure class="image is-32x32">
        <img
          :src="require('~/assets/export/' + `${flagImg}`)"
          :class="flagIconStyle"
          class="image is-32x32 is-rounded object-fit-cover"
        />
      </figure>
    </span>
    <span class="has-text-primary">{{ title }}</span>
  </nuxt-link>
</template>
<script>
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
    hasFlagImg() {
      return !!this.flagData.flag
    },
    flagImg() {
      if (this.flagData.flag) {
        return this.flagData.flag
      }
      return ''
    },
    title() {
      return this.$titleCase(this.flagId)
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
