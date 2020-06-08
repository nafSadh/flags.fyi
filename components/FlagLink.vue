<template>
  <nuxt-link :to="to">
    <span v-if="hasFlagSvg" class="icon">
      <img :src="require('~/assets/export/' + `${flagSvg}`)" />
    </span>
    <span>{{ title }}</span>
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
      return this.$titleCase(this.flagId)
    },
    to() {
      return {
        name: 'flagId',
        params: {
          flagId: this.flagId
        }
      }
    }
  }
}
</script>
