import Vue from 'vue'

// vue-json-component
import JSONView from 'vue-json-component'
Vue.use(JSONView)

// vue-shortkey
// Doc: https://github.com/iFgR/vue-shortkey
// npm: https://www.npmjs.com/package/vue-shortkey
const ShortKey = require('vue-shortkey')
Vue.use(ShortKey, { prevent: ['input', 'textarea'] })
export default ShortKey
