(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{227:function(t,n,e){"use strict";e(68),e(69),e(23),e(90);var l=e(10),r=e.n(l),c={props:{flagData:{type:Object,required:!0},flagId:{type:String,required:!0}},computed:{namespace:function(){return this.flagData.ns||r.a.split(this.flagId,"-")[0]},namePart:function(){return this.$namePartFromId(this.flagId,this.namespace)},hasFlagImg:function(){return"none"!==this.flagData.flag},flagImg:function(){return this.hasFlagImg?this.flagData.flag||this.$inferFlagSvg(this.namespace,this.namePart):""},name:function(){return this.flagData.name?this.flagData.name:this.$titleCase(this.flagId)},to:function(){return{name:"flagId",params:{flagId:this.flagId}}},flagIconStyle:function(){return{"object-at-left":r.a.has(this.flagData,"l")||!!this.flagData._&&this.flagData._.includes("left"),"object-at-right":r.a.has(this.flagData,"r")||!!this.flagData._&&this.flagData._.includes("right")}}}},f=e(16),component=Object(f.a)(c,(function(){var t=this,n=t.$createElement,l=t._self._c||n;return l("nuxt-link",{staticClass:"level-left",attrs:{to:t.to}},[t.hasFlagImg?l("span",{staticClass:"level-item"},[l("figure",{staticClass:"image is-32x32"},[l("img",{staticClass:"image is-32x32 is-rounded object-fit-cover",class:t.flagIconStyle,attrs:{src:e(197)("./"+t.flagImg)}})])]):t._e(),t._v(" "),l("span",{staticClass:"has-text-primary"},[t._v(t._s(t.name))])])}),[],!1,null,null,null);n.a=component.exports},492:function(t,n,e){"use strict";e.r(n);var l=e(227),r=e(215),c={components:{FlagLink:l.a},data:function(){return{}},computed:{flagsJson:function(){return r}}},f=e(16),component=Object(f.a)(c,(function(){var t=this.$createElement,n=this._self._c||t;return n("div",[this._m(0),this._v(" "),n("section",{staticClass:"section main-content container"},[n("div",{staticClass:"buttons"},this._l(this.flagsJson,(function(t,e){return n("button",{key:e,staticClass:"button is-rounded is-primary is-light py-0 pl-0 pr-4\n              level is-mobile "},[n("flag-link",{attrs:{"flag-id":e,"flag-data":t}})],1)})),0)])])}),[function(){var t=this.$createElement,n=this._self._c||t;return n("section",{staticClass:"hero is-primary"},[n("div",{staticClass:"hero-body"},[n("div",{staticClass:"container"},[n("h1",{staticClass:"title"},[this._v("Index of Flags")])])])])}],!1,null,null,null);n.default=component.exports}}]);