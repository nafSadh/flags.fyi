<template>
  <div>
    <nav-bar />
    <nuxt />
  </div>
</template>

<script>
import NavBar from '~/components/NavBar'
export default {
  components: {
    NavBar
  },
  data() {
    return {}
  },
  head: {
    bodyAttrs: {
      class: 'has-background-white has-navbar-fixed-top'
    }
  }
}
</script>
