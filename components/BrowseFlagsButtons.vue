<template>
  <div class="buttons has-addons">
    <nuxt-link-button
      icon="chevron-left"
      :to="toPrev"
      v-shortkey="{ 0: ['arrowleft'], p: ['p'] }"
      @shortkey.native="$router.push(toPrev)"
    />
    <nuxt-link-button
      icon="chevron-right"
      :to="toNext"
      v-shortkey="{ 0: ['arrowright'], n: ['n'] }"
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
