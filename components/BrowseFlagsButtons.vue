<template>
  <div class="buttons has-addons">
    <nuxt-link-button
      v-if="toPrev"
      v-shortkey="{ 0: ['arrowleft'], p: ['p'] }"
      icon="chevron-left"
      :to="toPrev"
      @shortkey.native="$router.push(toPrev)"
    />
    <nuxt-link-button
      v-if="toNext"
      v-shortkey="{ 0: ['arrowright'], n: ['n'] }"
      icon="chevron-right"
      :to="toNext"
      @shortkey.native="$router.push(toNext)"
    />
  </div>
</template>
<script>
import NuxtLinkButton from '~/components/NuxtLinkButton'
import metadata from '~/assets/flags/meta.json'

export default {
  components: { NuxtLinkButton },
  props: { flagId: { type: String, required: true } },
  data() {
    return {
      toPrev: metadata[this.flagId]
        ? this.$toFlagId(metadata[this.flagId].prev)
        : undefined,
      toNext: metadata[this.flagId]
        ? this.$toFlagId(metadata[this.flagId].next)
        : undefined
    }
  }
}
</script>
