# flagstaff/flags.fyi DEVNOTES

> A reverse chronological log

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
