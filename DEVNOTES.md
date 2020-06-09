# flagstaff/flags.fyi DEVNOTES

> A reverse chronological log

_2020.06.08_

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
    - move flag images to `~/asset/export/`
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
