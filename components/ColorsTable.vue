<template>
  <div v-if="hasColors" class="has-border-bottom-primary-light">
    <h2
      class="title is-5 card-header-title 
      has-background-primary-light has-text-primary"
    >
      Colors
    </h2>
    <b-table
      :data="colors"
      mobile-cards
      detailed
      :has-detailed-visible="(row) => !!row.note"
    >
      <template slot-scope="props">
        <b-table-column field="color">
          <fa
            icon="square"
            :style="{
              color: `${$rgb.hex(props.row.hex)}`
            }"
          />
          {{ $titleCase(props.row.color) }}
        </b-table-column>
        <b-table-column field="hex" label="Hex triplet">
          <template slot="header">
            <b-tooltip dashed :label="ColorInfo.hex.hint" position="is-right">
              <a target="_blank" :href="ColorInfo.hex.ref">RGB Hex</a>
            </b-tooltip>
          </template>
          <code
            :class="
              $rgb.luminance(props.row.hex) > 0.5
                ? 'has-text-dark'
                : 'has-text-light'
            "
            :style="{ background: `${$rgb.hex(props.row.hex)}` }"
            ><b>{{ $rgb.hex(props.row.hex) }}</b></code
          >
        </b-table-column>
        <b-table-column
          v-for="col of genericColumns"
          :key="col.field"
          :label="col.label"
        >
          <template slot="header" slot-scope="{ column }">
            <b-tooltip
              dashed
              :label="!!col.hint ? col.hint : col.label"
              position="is-right"
            >
              <a target="_blank" :href="col.ref"> {{ column.label }} </a>
            </b-tooltip>
          </template>
          {{ props.row[col.field] }}
        </b-table-column>
      </template>
      <template slot="detail" slot-scope="props">
        <article>
          {{ props.row.note }}
        </article>
      </template>
      <template v-if="note" slot="footer">
        <span class="has-text-grey has-text-weight-light">† {{ note }}</span>
      </template>
    </b-table>
  </div>
</template>
<script>
import _ from 'lodash'
import ColorInfo from '~/static/color-info.json'

export default {
  props: {
    colors: {
      type: Array,
      required: true
    },
    note: { type: String, default: undefined }
  },
  data() {
    return {
      ColorInfo
    }
  },
  computed: {
    hasColors() {
      return this.colors && this.colors.length > 0
    },
    genericColumns() {
      const genericCols = []
      const specificCols = new Set(['color', 'hex', 'note'])
      const alreadyProcessed = new Set()
      for (const row of this.colors) {
        for (const col of _.keys(row)) {
          if (!specificCols.has(col) && !alreadyProcessed.has(col)) {
            if (_.has(ColorInfo, col)) {
              const colInfo = ColorInfo[col]
              colInfo.field = col
              if (!_.has(colInfo, 'label')) {
                colInfo.label = this.$titleCase(col)
              }
              genericCols.push(colInfo)
            } else {
              genericCols.push({ field: col, label: this.$titleCase(col) })
            }
            alreadyProcessed.add(col)
          }
        }
      }
      return genericCols
    }
  }
}
</script>
