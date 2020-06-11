# 🚩 Flags.fyi

> **Flags** _for your info_, by Flagstaff

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# generate static project
$ npm run generate
```

## Definitions

- **Canonical path** is supposed to remain unchanged wrt time. For example,
  `https://flags.fyi/` should always refer to this website. In the same way,
  `https://flags.fyi/flags.json` is the canonical path for the JSON file holding
  flag data.
- In most cases we will be using **canonical rpath** (or simply "rpath"). A
  **rpath** is canonical path relative to site root; e.g., `flags.json` is rpath
  for aforementioned JSON. Site root can be referred to as `/`, but for other
  rpath, there should not be any leading slash.

## Directory Structure

Flagstaff/flags.fyi is built as a NuxtJS app and has following directory
structue:

- ~/**assets**
  - ~/assets/**export**: Contents from this directory is copied to generated
    site root. All content related to one country is usually placed in the same
    sub-directory. Files in this sub-directory should match rpath. This dir is
    virtually same as `~/static`.
  - ~/assets/**logo**: Directory for logo files.
  - ~/assets/**scss**: SCSS files.
- ~/**components**: Files for Vue.js Components. _Not supercharged by NuxtJS._
- ~/**layouts**: Vue files for
  [NuxtJS layouts](https://nuxtjs.org/guide/views#layouts).
- ~/**middleware**: {not used}
  [NuxtJS middleware](https://nuxtjs.org/guide/routing#middleware).
- ~/**pages** : This directory contains Application Views and Routes. NuxtJS
  reads all the `*.vue` files inside this directory and creates the
  [router](https://nuxtjs.org/guide/routing) of the app.
- ~/**plugins**: Javascript [plugins](https://nuxtjs.org/guide/plugins) that
  needs to run before mounting the root Vue.js application.
- ~/**static**: [Static files]](https://nuxtjs.org/guide/assets#static). Each
  file inside this directory is mapped to `/`. `CNAME` and `flags.json` resides
  here.
- ~/**store**: {not used} For [Vuex Store](https://nuxtjs.org/guide/vuex-store).
