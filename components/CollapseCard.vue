<template>
  <b-collapse class="card is-shadowless" animation="slide" :open="open">
    <div
      slot="trigger"
      slot-scope="props"
      class="card-header is-shadowless has-background-light"
      role="button"
    >
      <h3 class="card-header-title">
        {{ title }}
      </h3>
      <a class="card-header-icon">
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
