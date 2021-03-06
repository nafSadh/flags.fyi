# flagstaff/flags.fyi DEVNOTES

> A reverse chronological log

_2020.06.16-28_

- **flags/meta.json**
  Previous/next navigation was generated in utils and was attached to Vue. This
  led to some issues. Now, added `compile-flags.py` script to generate a
  `flags/meta.json` from `flags.json`.

_2020.06.16-23_

- **namespace.dot**
  Multiple namespaces may share same directory. For example, british oversearch
  terrtories and british crown dependencies both can share same ./british/
  directory with first one in `british` namespace and the second one in
  `british.cd` namespace.

  This is achieved by introducing the concept of dot namespace, where
  resource related to a `namespace.dot` resides in `namespace` directory.

_2020.06.16-21_

- **[flags]**  
  moved `~/asset/export/` to `~/asset/flags/` to better match with commit tag:
  [flag]
- Renamed primary branch name to 'default' from 'master'

_2020.06.16-18_

- **support markdown content**
  Some flag info may contain rich text content. For example as `article` field.
  This can wither be markdown formatted string inline in `flags.json` files or
  some `*.md` file.  
   These contents need to be loaded and rendered within Vue pages.

  Since, this project is using NuxtJS, official Nuxt wrapper for [markdown-it
  ](https://github.com/markdown-it/markdown-it), [@nuxtjs/markdownit
  ](https://github.com/nuxt-community/modules/tree/master/packages/markdownit)
  is the natural first choice. However, it is not the ideal candidate, was it
  relies on `v-html=` binding. Moreover, it is not well suited for loading `.md`
  files as it tends to load html-fied content from those.

  Thus we are using either of:

  1. [markdown-it-vue](https://github.com/ravenq/markdown-it-vue).
     `npm i markdown-it-vue --save`
     - This leads to large build, jumping from 1.98 MB to ~4MB. Switching to
       `import MarkdownItVueLight from 'markdown-it-vue/dist/markdown-it-vue-light.umd.min.js'`
       can reduce the size to 3.35MB.
     - markdown-it-vue and its light version comes with many fancy stuff ans css
       which makes it bloat
  2. [vue-markdown](https://www.npmjs.com/package/vue-markdown)
     Note: it was throwing some error complaining about babel runtime.
     Per [this gh issue](https://github.com/miaolz123/vue-markdown/issues/18),
     `npm i babel-runtime --save`, solves it.
     - this still results in a build of 2.56 MB

  Beware: both of them are still doing client side loading.

  TODO: Find a way to optimize size, also have things ssr'd.

  To load raw `markdown` contents from `.md` files using webpack `require()`,
  we need to use [raw-loader](https://webpack.js.org/loaders/raw-loader/)  
  `npm install raw-loader --save-dev`

  Add following settings to `nuxt.config.js`:

  ```js
  build: {
    extend(config, ctx) {
      config.module.rules.push({
        test: /\.md$/i,
        use: 'raw-loader'
      })
    }
  }
  ```

_2020.06.16-17_

- **optimize generated file sizes**
  - [optimizeCSS](https://nuxtjs.org/api/configuration-build/#optimizecss)  
    bangladesh/index.html 90kB -> no change  
    total /dist 14.2MB -> no change
  - [extractCSS](https://nuxtjs.org/api/configuration-build/#extractcss)
    bangladesh/index.html 90kB -> 8.36kB  
    total /dist 14.2MB -> 2.70MB
  - [PurgeCSS](https://github.com/Developmint/nuxt-purgecss)  
    bangladesh/index.html 8.36kB -> not affected  
    generated total CSS files ~900kB -> ~50kB  
    total /dist 2.70MB -> 1.98MB  
    !!! but messes up style and layout
  - Optimize Font Awesome imports
    bangladesh/index.html 8.36kB -> 7.86kB  
    generated total CSS files ~900kB -> ~800kB  
    total /dist 2.70MB -> 1.98MB

_2020.06.16_

- **use npm/gh-pages for deplyments**
  - install using `npm i -D gh-pages`
  - add script in `package.json`:
    `"deploy": "gh-pages -d dist -m 'deploy changes'"`
  - sadly gh-pages doesn't update server for new files immediately and thus
    breaking things

_2020.06.15_

- **Color strings**
  - **RGB Hex**: Follow [Google HTML/CSS Style Guide
    ](https://google.github.io/styleguide/htmlcssguide.html#Capitalization) and
    "rules for serializing simple color values" from [WHATWG HTML standard
    ](https://html.spec.whatwg.org/#colours), thus use [valid lowercase simple
    color](https://html.spec.whatwg.org/#valid-lowercase-simple-colour)
    , i.e., '#' followed by six lowercase hexadecimal digits; e.g.: #17afee.
    - Exception: To avoid typo, in JSON and code, shorthand is preferred for
      white (#fff), black (#000) and any color where all six digit are same
      (e.g., #yyy instead of #yyyyyy). For, rendered HTML use full 7 character.

_2020.06.13_

- **Vue.js Slots**

  - [Slot](https://vuejs.org/v2/guide/components-slots.html)s can be used to pass
    through content into components.

- **Display JSON data in tree format**

  - There are few Vue plugins for this, e.g., 'vue-json-component' and
    'vue-json-tree-view'.

- **Installing Vue components/packages**
  This was bit of hurdle. Some npm installed third-party components/packages
  cannot be imported right away.

  In constrast vanilla js npm packages like, `lodash` can be npm installed and
  used in any .vue file right away like this:

  ```js
  import _ from 'lodash'
  ```

  Vue plugins need to be [setup](https://nuxtjs.org/guide/plugins/#vue-plugins) in
  NuxtJS. Some of them don't play nice with SSR. Set `ssr` to false for these.

  ```js
  plugins: [{ src: '~/plugins/install-no-ssr.js', ssr: false }]
  ```

  See: [SO answer](https://stackoverflow.com/q/54525838/).

  You might end up seeing following warning:

  ```
  [Vue warn]: The client-side rendered virtual DOM tree is not matching
  server-rendered content. This is likely caused by incorrect HTML markup, for
  example nesting block-level elements inside <p>, or missing <tbody>. Bailing
  hydration and performing full client-side render.
  ```

  One solution can be wrapping use of such components within `<client-only>`.
  See more on:
  [Develop Paper](https://developpaper.com/a-common-error-warning-for-nuxt-js/).

_2020.06.12_

- **Supplementary flags.json files**
  - Flags.fyi aims to collect a lage amount of data on flags. This may lead to
    a very large `flags.json` file. The solution is to split this JSON file into
    many.
  - In the spirit of revolving around single `flags.json`, we will split data by
    fields. Top level `flags.json` will only contain bare minimum essential
    fields, such as, flag-id, svg, used as etc. All non essential fields, such
    as, color data, related flags etc. will be in many auxiliary JSON files.
  - Auxiliary JSON (auxJson) files will be in `~/assets/flags/` directories.
  - The first part of kebob-cased-flag-id is idPrefix. AuxJson files will be in
    directory named idPrefix. For example, auxJson for both `bangladesh` and
    `bangladesh-navy` is located at `~/assets/flags/bangladesh/flags.json`.
  - To resolve existence of auxJson and loading them with ease, they need to be
    registered in `~/assets/flags/add-to-flags.json`.

_2020.06.09_

- Bulma v0.9.0
  - Bulma released v0.9.0 but Buefy is on v0.7.5 and has yet to publish roadmap
  - meanwhile '@nuxtjs/bulma' from gh/nuxt-community/modules is yet to update
  - use https://gitpkg.now.sh/ to install Bulma from a fork of '@nuxtjs/bulma':
    - `npm i 'https://gitpkg.now.sh/nafSadh/nuxt-modules/packages/bulma?master' --save`
    - add '@nuxtjs/bulma'to nuxt.config.js:modules

_2020.06.08_

- The **Flagstaff logo** is used to represent both 'flags.fyi' and 'Flagstaff'.
  It is essentially a flag on a flagstaff that looks like the letter 'F'.

_2020.06.06_

- uniform static-asset content structure
  - Flag images (svg and in on-ideal cases png/jpeg) needs to be displayed on
    (A) vue generated pages, such as, `_flagId.vue` (e.g. as an img loaded into
    https://flags.fyi/bangladesh/) and (B) available as direct url, e.g.,
    https://flags.fyi/bangladesh/flags.svg). For case A, to display htmls with
    preloaded img, these files needs to be served using webpack and hence be in
    `~/assets/` directory. In contrast, for case B, these files also need to be
    served from generated websites root location, i.e., as if they were in nuxt
    `~/static/` directory.
    Hence:
    - move flag images to ~~`~/asset/export/`~~
      <small>[updated on 2020.06.21:]</small> `~/asset/flags/`
    - use `npm i copy-dir --save-dev` to copy files from this directory to the
      `dist/` root upon `nuxt generate` by adding a hook to `generate.done`

_2020.06.03_

- set local run --port 61495 as it is the leet for `flags` |f6|l1|A4|g9|S5|
- unified URL structure:
  - flags.fyi/:flag/ should be the url for the page about the flag
    - hence `~/pages/_flag_id.vue`
  - flags.fyi/:flag/file.ext should be the url for static resources
    - hence `~/static/:flag/...`
- switch nuxt.mode to `universal` so that browser gets generated pages loaded with content

_2020.06.02_

- setup dynamic route generation for flag ids
  - add dummy static/flags.json
  - setup `generate.routes()` in `nuxt.config.js`
- setup nuxt generated spa deployment for gh-pages
  - `npm install push-dir --save-dev`
  - add deploy script to `package.json`
    - `"deploy": "push-dir --dir=dist --branch=gh-pages --cleanup"`
  - move CNAME to static/CNAME
  - commit then run `npm run generate` and `npm run deploy`
  - switch "GitHub pages source" to `gh-pages` branch

_2020.06.01_

- restart as a [Vue](https://vuejs.org/) powered statically generated web app
  using [NuxtJS](https://nuxtjs.org/)
  - `npx create-nuxt-app flags.fyi`
- clean slate

_init_
