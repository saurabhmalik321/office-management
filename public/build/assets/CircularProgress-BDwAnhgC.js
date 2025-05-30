import{r as R,j as u}from"./app-BgYIljHB.js";import{i as q,T as A,g as D,a as j,d as w,c as N,r as M,b as m}from"./createTheme-C0N1oR7_.js";import{g as F,u as T,s as f,c as U,m as C,a as z,d as E,k as I}from"./createSimplePaletteValueFilter-B4mKZBtx.js";function K(){const e=q(F);return e[A]||e}function O(e){return D("MuiPaper",e)}j("MuiPaper",["root","rounded","outlined","elevation","elevation0","elevation1","elevation2","elevation3","elevation4","elevation5","elevation6","elevation7","elevation8","elevation9","elevation10","elevation11","elevation12","elevation13","elevation14","elevation15","elevation16","elevation17","elevation18","elevation19","elevation20","elevation21","elevation22","elevation23","elevation24"]);const V=e=>{const{square:r,elevation:a,variant:s,classes:t}=e,n={root:["root",s,!r&&"rounded",s==="elevation"&&`elevation${a}`]};return U(n,O,t)},B=f("div",{name:"MuiPaper",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.root,r[a.variant],!a.square&&r.rounded,a.variant==="elevation"&&r[`elevation${a.elevation}`]]}})(C(({theme:e})=>({backgroundColor:(e.vars||e).palette.background.paper,color:(e.vars||e).palette.text.primary,transition:e.transitions.create("box-shadow"),variants:[{props:({ownerState:r})=>!r.square,style:{borderRadius:e.shape.borderRadius}},{props:{variant:"outlined"},style:{border:`1px solid ${(e.vars||e).palette.divider}`}},{props:{variant:"elevation"},style:{boxShadow:"var(--Paper-shadow)",backgroundImage:"var(--Paper-overlay)"}}]}))),ee=R.forwardRef(function(r,a){var c;const s=T({props:r,name:"MuiPaper"}),t=K(),{className:n,component:d="div",elevation:o=1,square:y=!1,variant:l="elevation",...v}=s,p={...s,component:d,elevation:o,square:y,variant:l},g=V(p);return u.jsx(B,{as:d,ownerState:p,className:N(g.root,n),ref:a,...v,style:{...l==="elevation"&&{"--Paper-shadow":(t.vars||t).shadows[o],...t.vars&&{"--Paper-overlay":(c=t.vars.overlays)==null?void 0:c[o]},...!t.vars&&t.palette.mode==="dark"&&{"--Paper-overlay":`linear-gradient(${w("#fff",M(o))}, ${w("#fff",M(o))})`}},...v.style}})});function G(e){return D("MuiCircularProgress",e)}j("MuiCircularProgress",["root","determinate","indeterminate","colorPrimary","colorSecondary","svg","circle","circleDeterminate","circleIndeterminate","circleDisableShrink"]);const i=44,k=I`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`,x=I`
  0% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 100px, 200px;
    stroke-dashoffset: -15px;
  }

  100% {
    stroke-dasharray: 1px, 200px;
    stroke-dashoffset: -126px;
  }
`,H=typeof k!="string"?E`
        animation: ${k} 1.4s linear infinite;
      `:null,W=typeof x!="string"?E`
        animation: ${x} 1.4s ease-in-out infinite;
      `:null,Z=e=>{const{classes:r,variant:a,color:s,disableShrink:t}=e,n={root:["root",a,`color${m(s)}`],svg:["svg"],circle:["circle",`circle${m(a)}`,t&&"circleDisableShrink"]};return U(n,G,r)},_=f("span",{name:"MuiCircularProgress",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.root,r[a.variant],r[`color${m(a.color)}`]]}})(C(({theme:e})=>({display:"inline-block",variants:[{props:{variant:"determinate"},style:{transition:e.transitions.create("transform")}},{props:{variant:"indeterminate"},style:H||{animation:`${k} 1.4s linear infinite`}},...Object.entries(e.palette).filter(z()).map(([r])=>({props:{color:r},style:{color:(e.vars||e).palette[r].main}}))]}))),J=f("svg",{name:"MuiCircularProgress",slot:"Svg"})({display:"block"}),L=f("circle",{name:"MuiCircularProgress",slot:"Circle",overridesResolver:(e,r)=>{const{ownerState:a}=e;return[r.circle,r[`circle${m(a.variant)}`],a.disableShrink&&r.circleDisableShrink]}})(C(({theme:e})=>({stroke:"currentColor",variants:[{props:{variant:"determinate"},style:{transition:e.transitions.create("stroke-dashoffset")}},{props:{variant:"indeterminate"},style:{strokeDasharray:"80px, 200px",strokeDashoffset:0}},{props:({ownerState:r})=>r.variant==="indeterminate"&&!r.disableShrink,style:W||{animation:`${x} 1.4s ease-in-out infinite`}}]}))),re=R.forwardRef(function(r,a){const s=T({props:r,name:"MuiCircularProgress"}),{className:t,color:n="primary",disableShrink:d=!1,size:o=40,style:y,thickness:l=3.6,value:v=0,variant:p="indeterminate",...g}=s,c={...s,color:n,disableShrink:d,size:o,thickness:l,value:v,variant:p},h=Z(c),P={},b={},$={};if(p==="determinate"){const S=2*Math.PI*((i-l)/2);P.strokeDasharray=S.toFixed(3),$["aria-valuenow"]=Math.round(v),P.strokeDashoffset=`${((100-v)/100*S).toFixed(3)}px`,b.transform="rotate(-90deg)"}return u.jsx(_,{className:N(h.root,t),style:{width:o,height:o,...b,...y},ownerState:c,ref:a,role:"progressbar",...$,...g,children:u.jsx(J,{className:h.svg,ownerState:c,viewBox:`${i/2} ${i/2} ${i} ${i}`,children:u.jsx(L,{className:h.circle,style:P,ownerState:c,cx:i,cy:i,r:(i-l)/2,fill:"none",strokeWidth:l})})})});export{re as C,ee as P,K as u};
