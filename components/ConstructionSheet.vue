<template>
  <figure v-if="!!cs" class="image " :class="expanded ? fullStyle : thumbStyle">
    <img
      :src="require('~/assets/flags/' + `${cs}`)"
      class="has-max-width-tablet"
    />
    <figcaption @click="expanded = !expanded">
      Construction sheet
      <a class="is-hidden-mobile">
        <fa :icon="expanded ? 'compress' : 'expand-arrows-alt'" />
      </a>
    </figcaption>
  </figure>
</template>
<script>
export default {
  props: {
    cs: { type: String, required: true },
    fullStyle: { type: String, default: '' },
    thumbStyle: { type: String, default: 'is-tablet-160x160 is-pulled-right' }
  },
  data() {
    return {
      expanded: false
    }
  }
}
</script>
