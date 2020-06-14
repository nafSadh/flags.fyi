<template>
  <div v-if="hasColors">
    <h3>Colors</h3>
    <b-table :data="colors">
      <template slot-scope="props">
        <b-table-column field="color">
          <fa
            icon="square"
            :style="{
              color: '#' + `${props.row.hex}`
            }"
          />
          {{ $titleCase(props.row.color) }}
        </b-table-column>
        <b-table-column field="hex" label="Hex triplet">
          <template slot="header">
            <b-tooltip label="Hex triplet" position="is-right" dashed>
              <a href="https://en.wikipedia.org/wiki/Hex_triplet">Hex</a>
            </b-tooltip>
          </template>
          <code
            :class="
              $rLuminance(props.row.hex) > 0.5
                ? 'has-text-dark'
                : 'has-text-light'
            "
            :style="{ background: '#' + `${props.row.hex}` }"
            ><b>#{{ props.row.hex }}</b></code
          >
        </b-table-column>
        <b-table-column
          v-for="col of genericColumns"
          :key="col.field"
          :label="col.label"
        >
          {{ props.row[col.field] }}
        </b-table-column>
      </template>
    </b-table>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  props: {
    colors: {
      type: Array,
      required: true
    }
  },
  computed: {
    hasColors() {
      return this.colors && this.colors.length > 0
    },
    genericColumns() {
      const genericCols = []
      const specificCols = new Set(['color', 'hex'])
      const alreadyProcessed = new Set()
      for (const row of this.colors) {
        for (const col of _.keys(row)) {
          if (!specificCols.has(col) && !alreadyProcessed.has(col)) {
            genericCols.push({ field: col, label: this.$titleCase(col) })
          }
        }
      }
      return genericCols
    }
  }
}
</script>
