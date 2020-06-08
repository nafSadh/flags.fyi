<template>
  <div>
    <nuxt-link :to="to">
      {{ title }}
    </nuxt-link>
  </div>
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
