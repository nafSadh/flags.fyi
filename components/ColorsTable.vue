<template>
  <div v-if="hasColors">
    <h3>Colors</h3>
    <b-table :data="formattedData" :columns="columns"></b-table>
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
    formattedData() {
      const data = []
      for (const row of this.colors) {
        const rowData = {}
        for (const col of _.keys(row)) {
          const val = row[col]
          switch (col) {
            case 'hex':
              rowData.hex = '#' + val
              break
            case 'color':
              rowData.color = this.$titleCase(val)
              break
            default:
              rowData[col] = val
          }
        }
        data.push(rowData)
      }
      return data
    },
    columns() {
      const columns = [
        { field: 'color' },
        { field: 'hex', label: 'Hex triplet' }
      ]
      const fixedCols = new Set(['color', 'hex'])
      const addedColumns = new Set()
      for (const row of this.colors) {
        for (const col of _.keys(row)) {
          if (!fixedCols.has(col) && !addedColumns.has(col)) {
            columns.push({ field: col, label: this.$titleCase(col) })
          }
        }
      }
      return columns
    }
  }
}
</script>
