import flagsJson from './static/flags.json'

export default {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Global CSS
   */
  css: ['@/assets/style/style.scss', '@/assets/style/style.css'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    { src: '~/plugins/install-no-ssr.js', ssr: false },
    '~/plugins/utils.js'
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module'
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://github.com/nuxt-community/modules/tree/master/packages/bulma
    '@nuxtjs/bulma',
    // Doc: https://buefy.github.io/#/documentation
    'nuxt-buefy',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    // Doc: https://github.com/nuxt-community/dotenv-module
    '@nuxtjs/dotenv',
    // Doc: https://github.com/vaso2/nuxt-fontawesome
    'nuxt-fontawesome'
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Build configuration
   */
  build: {
    extractCSS: true,
    optimizeCSS: {},
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      config.module.rules.push({
        test: /\.md$/i,
        use: 'raw-loader'
      })
    },
    postcss: {
      preset: {
        features: {
          customProperties: false
        }
      }
    }
  },

  generate: {
    /* generate route for _flagId.vue pages */
    routes() {
      const flagRoutes = []
      for (const flagId in flagsJson) {
        flagRoutes.push('/' + flagId)
      }
      return flagRoutes
    }
  },

  hooks: {
    generate: {
      /* hook: function run upon nuxt generate 
      https://nuxtjs.org/api/internals-generator#hooks */
      done(generator, errors) {
        /* use https://www.npmjs.com/package/copy-dir to 
        export some assets to root */
        const copydir = require('copy-dir')
        copydir.sync('./assets/export', './dist')
      }
    }
  },

  fontawesome: {
    component: 'fa',
    imports: [
      {
        set: '@fortawesome/free-solid-svg-icons',
        icons: [
          'faListUl',
          'faSquare',
          'faChevronUp',
          'faChevronDown',
          'faCompress',
          'faExpandArrowsAlt'
        ]
      }
      // {
      //   set: '@fortawesome/free-regular-svg-icons',
      //   icons: ['far']
      // }
    ]
  }
}
