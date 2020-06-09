<template>
  <nuxt-link :to="to" class="level-left">
    <span v-if="hasFlagSvg" class="level-item">
      <figure class="image is-32x32">
        <img
          :src="require('~/assets/export/' + `${flagSvg}`)"
          class="image is-32x32 is-rounded"
          style="object-fit:cover;"
        />
      </figure>
    </span>
    <span class="">{{ title }}</span>
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
