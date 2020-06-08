import Vue from 'vue'
import _ from 'lodash'

Vue.prototype.$titleCase = function(str) {
  if (str.length < 3) {
    return _.toUpper(str)
  }
  return _.words(str)
    .map(_.upperFirst)
    .join(' ')
}
