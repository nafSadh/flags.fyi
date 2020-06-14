<template>
  <b-collapse class="card is-shadowless" animation="slide" :open="open">
    <div
      slot="trigger"
      slot-scope="props"
      class="card-header is-shadowless has-background-light"
      role="button"
    >
      <h2
        class="card-header-title 
        has-background-primary-light has-text-primary 
        has-text-weight-semibold is-size-5"
      >
        {{ title }}
      </h2>
      <a class="card-header-icon has-background-primary-light">
        <fa
          :icon="props.open ? ['fas', 'chevron-up'] : ['fas', 'chevron-down']"
        />
      </a>
    </div>
    <div class="card-content">
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </b-collapse>
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    open: {
      type: Boolean,
      default: false
    }
  }
}
</script>
