import Vue from 'vue'
import _ from 'lodash'

Vue.prototype.$parseHex = function(hex) {
  return parseInt(Number('0x' + hex), 10)
}

Vue.prototype.$rgb = (function() {
  /**
   * Converts input string to valid lowercase simple color
   * see: https://html.spec.whatwg.org/#valid-lowercase-simple-colour
   *
   * @param {sring} str one of 3/4/6/7 character long string representing rgb
   * @returns {string} string formatted as valid lowercase simple color
   */
  function formatAsSimpleColorString(str) {
    const expandFromShorthand3 = function(s) {
      const r = s[0]
      const g = s[1]
      const b = s[2]
      return r + r + g + g + b + b
    }
    if (_.isString(str)) {
      str = _.toLower(_.trim(str))
      // TODO: check string contains only valid hexadecimal digits
      switch (str.length) {
        case 7:
          return str
        case 6:
          return '#' + str
        case 4:
          return '#' + expandFromShorthand3(str.substr(1))
        case 3:
          return '#' + expandFromShorthand3(str)
      }
    }
    return undefined
  }

  /**
   * Parses a hex triplet string and returns r,g,b values as an object.
   *
   * For example `$rgb.parse("#123456")` -> `{ "r": 18, "g": 52, "b": 86 }`
   *
   * @param {string} str - a string represneing RGB as hex tripets
   * @returns {object} an object
   */
  function parse(str) {
    const parseHex = function(hh) {
      return parseInt(Number('0x' + hh), 10)
    }

    const rgbHex = formatAsSimpleColorString(str)
    if (rgbHex) {
      return {
        r: parseHex(rgbHex.substr(1, 2)),
        g: parseHex(rgbHex.substr(3, 2)),
        b: parseHex(rgbHex.substr(5, 2))
      }
    }
    return undefined
  }

  /**
   * Compute relativ luminance from RGB hex values.
   * https://en.wikipedia.org/wiki/Relative_luminance
   *
   * see also: https://stackoverflow.com/q/1855884/
   *
   * @param {string} rgbString
   * @returns {number} a value between 0.00  and 1.00 with 1.00 being brightest
   */
  function relativeLuminance(rgbString) {
    const rgb = parse(rgbString)

    return rgb
      ? (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255.0
      : undefined
  }

  // export public functions
  return {
    asSimpleColorString: formatAsSimpleColorString,
    formatAsSimpleColorString,
    luminance: relativeLuminance,
    parse,
    relativeLuminance,
    rLuminance: relativeLuminance,
    hex: formatAsSimpleColorString
  }
})()

const noTitleCase = new Set(['a', 'an', 'and', 'the'])

Vue.prototype.$titleCase = function(str) {
  if (str.length < 3) {
    return _.toUpper(str)
  }
  return _.words(str)
    .map((word) => (noTitleCase.has(word) ? word : _.upperFirst(word)))
    .join(' ')
}

Vue.prototype.$namePartFromId = function(flagId, namespace) {
  const dashIndex = flagId.indexOf('-')
  return _.startsWith(flagId, namespace)
    ? dashIndex > 0
      ? flagId.substring(dashIndex + 1)
      : ''
    : flagId
}

Vue.prototype.$dirName = function(namespace) {
  return _.split(namespace, '.')[0]
}

Vue.prototype.$inferFlagSvg = function(namespace, namePart) {
  const fileNamePart = namePart && namePart.length > 0 ? namePart : 'flag'
  const folderPart = Vue.prototype.$dirName(namespace)
  return folderPart + '/' + fileNamePart + '.svg'
}

Vue.prototype.$arrayText = function(arrayText) {
  if (_.isString(arrayText)) {
    return arrayText
  } else if (_.isArray(arrayText)) {
    let text = ''
    for (const str of arrayText) {
      text += str + ' '
    }
    return text
  }
  return ''
}

Vue.prototype.$toFlagId = function(flagId) {
  return { name: 'flagId', params: { flagId } }
}

Vue.prototype.$parseUse = function(use) {
  const useObj = { as: _.isString(use) ? use : 'flag' }
  return _.isObject(use) ? _.merge(useObj, use) : useObj
}
