<!-- a button in a <nuxt-link/>, can have fa icon and the slot. -->
<template>
  <nuxt-link :to="to" class="button">
    <span v-if="!!icon" class="icon is-small">
      <fa :icon="icon" />
    </span>
    <span v-if="this.$slots.default">
      <slot></slot>
    </span>
  </nuxt-link>
</template>
<script>
export default {
  props: {
    to: { type: Object, required: true },
    icon: { type: String, default: undefined }
  }
}
</script>
