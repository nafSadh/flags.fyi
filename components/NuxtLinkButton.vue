<!-- 
A button in a <nuxt-link>, can have fa icon and the slot. 

<nuxt-link-button> extends <nuxt-link> (https://nuxtjs.org/api/components-nuxt-link/),
which in turn extends <router-link> with tag (https://router.vuejs.org/api/#tag)
set to button. This way, it renders as a button.  
-->
<template>
  <nuxt-link tag="button" :to="to" class="button">
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
