<template>
  <div class="buttons has-addons">
    <nuxt-link-button
      v-shortkey="{ 0: ['arrowleft'], p: ['p'] }"
      icon="chevron-left"
      :to="toPrev"
      @shortkey.native="$router.push(toPrev)"
    />
    <nuxt-link-button
      v-shortkey="{ 0: ['arrowright'], n: ['n'] }"
      icon="chevron-right"
      :to="toNext"
      @shortkey.native="$router.push(toNext)"
    />
  </div>
</template>
<script>
import NuxtLinkButton from '~/components/NuxtLinkButton'
export default {
  components: { NuxtLinkButton },
  props: { flagId: { type: String, required: true } },
  data() {
    return {
      toPrev: this.$toFlagId(this.$metadata[this.flagId].prev),
      toNext: this.$toFlagId(this.$metadata[this.flagId].next)
    }
  }
}
</script>
