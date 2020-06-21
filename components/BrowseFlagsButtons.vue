<template>
  <div class="buttons has-addons ">
    <nuxt-link-button
      icon="chevron-left"
      :to="{ name: 'flagId', params: { flagId: $metadata[flagId].prev } }"
    />
    <nuxt-link-button
      icon="chevron-right"
      :to="{ name: 'flagId', params: { flagId: $metadata[flagId].next } }"
    />
  </div>
</template>
<script>
import NuxtLinkButton from '~/components/NuxtLinkButton'
export default {
  components: { NuxtLinkButton },
  props: { flagId: { type: String, required: true } }
}
</script>
