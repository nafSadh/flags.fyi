<!-- 
  Vexillum is the Latin root of the word Vexillology (the study of flags).
  Vexillum roughly means flag, banner. 
  https://en.wiktionary.org/wiki/vexillum#Latin

  In Flags.fyi, Vexilum displays a flag image in a hero.
-->
<template>
  <section v-if="hasFlagImg" class="hero is-white has-transparent-fill">
    <div class="hero-body ">
      <div class="container ">
        <figure class="image box px-0 py-0 container">
          <img :src="require('~/assets/export/' + `${flagImg}`)" />
        </figure>
      </div>
    </div>
  </section>
</template>
<script>
export default {
  props: {
    flag: {
      type: String,
      required: true
    }
  },
  computed: {
    hasFlagImg() {
      return this.flag !== 'none'
    },
    flagImg() {
      if (this.flag) {
        return this.flag
      }
      return ''
    }
  }
}
</script>
