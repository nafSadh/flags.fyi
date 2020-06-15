<template>
  <div>
    <section class="hero is-primary">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">Index of Flags</h1>
        </div>
      </div>
    </section>
    <section class="section main-content container">
      <div class="buttons">
        <button
          v-for="(flagData, flagId) in flagsJson"
          :key="flagId"
          class="button is-rounded is-light py-0 pl-0 pr-4
                level is-mobile "
        >
          <flag-link :flag-id="flagId" :flag-data="flagData" />
        </button>
      </div>
    </section>
    <section class="section container">
      <div class="columns is-multiline is-mobile is-variable is-1">
        <div
          v-for="(flagData, flagId) in flagsJson"
          :key="flagId"
          class="column is-2"
        >
          <div class="card">
            <div class="card-image">
              <div class="card-content has-background-light py-2">
                {{ flagId }}
              </div>
              <figure class="image">
                <img
                  :src="require('~/assets/export/' + `${flagData.flag}`)"
                  class="image object-fit-cover"
                />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="section container">
      <span v-for="(flagData, flagId) in flagsJson" :key="flagId">
        <span class="is-size-4">
          <span class="icon is-medium">
            <img :src="require('~/assets/export/' + `${flagData.flag}`)" />
          </span>
          {{ flagId }}
        </span>
      </span>
    </section>
  </div>
</template>
<script>
import FlagLink from '~/components/FlagLink'
import flagJson from '~/static/flags.json'

export default {
  components: {
    FlagLink
  },
  data() {
    return {}
  },
  computed: {
    flagsJson() {
      return flagJson
    }
  }
}
</script>
