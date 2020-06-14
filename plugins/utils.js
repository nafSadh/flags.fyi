import Vue from 'vue'
import _ from 'lodash'

Vue.prototype.$parseHex = function(hex) {
  return parseInt(Number('0x' + hex), 10)
}

Vue.prototype.$hexShorthandToFull = function(hex) {
  const r = hex[0]
  const g = hex[1]
  const b = hex[2]
  return r + r + g + g + b + b
}

Vue.prototype.$hexToRGB = function(rgbHex) {
  const sixDigitHexToRGB = function(hex, that) {
    return {
      r: that.$parseHex(hex.substr(0, 2)),
      g: that.$parseHex(hex.substr(2, 2)),
      b: that.$parseHex(hex.substr(4, 2))
    }
  }
  if (_.isString(rgbHex)) {
    switch (rgbHex.length) {
      case 7:
        return rgbHex[0] === '#' ? sixDigitHexToRGB(rgbHex.substr(1), this) : {}
      case 6:
        return sixDigitHexToRGB(rgbHex, this)
      case 4:
        return rgbHex[0] === '#'
          ? sixDigitHexToRGB(this.$hexShorthandToFull(rgbHex.substr(1)), this)
          : {}
      case 3:
        return sixDigitHexToRGB(this.$hexShorthandToFull(rgbHex), this)
    }
    return {}
  }
  return {}
}

Vue.prototype.$rLuminance = function(rgbHex) {
  // see: Determine font color based on background color
  // https://stackoverflow.com/q/1855884/
  // see: Relative Luminance https://en.wikipedia.org/wiki/Relative_luminance
  const rgb = this.$hexToRGB(rgbHex)

  return (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255.0
}

Vue.prototype.$titleCase = function(str) {
  if (str.length < 3) {
    return _.toUpper(str)
  }
  return _.words(str)
    .map(_.upperFirst)
    .join(' ')
}
