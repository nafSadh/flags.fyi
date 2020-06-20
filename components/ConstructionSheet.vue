<template>
  <figure
    v-if="!!cs"
    class="image "
    :class="expanded ? '' : 'is-160x160 is-pulled-right'"
  >
    <img :src="require('~/assets/export/' + `${cs}`)" />
    <figcaption @click="expanded = !expanded">
      Construction sheet
      <a>
        <fa :icon="expanded ? 'compress' : 'expand-arrows-alt'" />
      </a>
    </figcaption>
  </figure>
</template>
<script>
export default {
  props: { cs: { type: String, required: true } },
  data() {
    return { expanded: false }
  }
}
</script>
