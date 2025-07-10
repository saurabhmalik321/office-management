import{r as v,j as C}from"./app-BgYIljHB.js";import{g as k,a as w,c as S,d as x}from"./createTheme-C0N1oR7_.js";import{u as R,s as $,c as U,m as M,d as h,k as f}from"./createSimplePaletteValueFilter-B4mKZBtx.js";function A(t){return String(t).match(/[\d.\-+]*\s*(.*)/)[1]||""}function X(t){return parseFloat(t)}function j(t){return k("MuiSkeleton",t)}w("MuiSkeleton",["root","text","rectangular","rounded","circular","pulse","wave","withChildren","fitContent","heightAuto"]);const B=t=>{const{classes:e,variant:a,animation:n,hasChildren:o,width:r,height:s}=t;return U({root:["root",a,n,o&&"withChildren",o&&!r&&"fitContent",o&&!s&&"heightAuto"]},j,e)},i=f`
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }

  100% {
    opacity: 1;
  }
`,l=f`
  0% {
    transform: translateX(-100%);
  }

  50% {
    /* +0.5s of delay between each loop */
    transform: translateX(100%);
  }

  100% {
    transform: translateX(100%);
  }
`,E=typeof i!="string"?h`
        animation: ${i} 2s ease-in-out 0.5s infinite;
      `:null,K=typeof l!="string"?h`
        &::after {
          animation: ${l} 2s linear 0.5s infinite;
        }
      `:null,N=$("span",{name:"MuiSkeleton",slot:"Root",overridesResolver:(t,e)=>{const{ownerState:a}=t;return[e.root,e[a.variant],a.animation!==!1&&e[a.animation],a.hasChildren&&e.withChildren,a.hasChildren&&!a.width&&e.fitContent,a.hasChildren&&!a.height&&e.heightAuto]}})(M(({theme:t})=>{const e=A(t.shape.borderRadius)||"px",a=X(t.shape.borderRadius);return{display:"block",backgroundColor:t.vars?t.vars.palette.Skeleton.bg:x(t.palette.text.primary,t.palette.mode==="light"?.11:.13),height:"1.2em",variants:[{props:{variant:"text"},style:{marginTop:0,marginBottom:0,height:"auto",transformOrigin:"0 55%",transform:"scale(1, 0.60)",borderRadius:`${a}${e}/${Math.round(a/.6*10)/10}${e}`,"&:empty:before":{content:'"\\00a0"'}}},{props:{variant:"circular"},style:{borderRadius:"50%"}},{props:{variant:"rounded"},style:{borderRadius:(t.vars||t).shape.borderRadius}},{props:({ownerState:n})=>n.hasChildren,style:{"& > *":{visibility:"hidden"}}},{props:({ownerState:n})=>n.hasChildren&&!n.width,style:{maxWidth:"fit-content"}},{props:({ownerState:n})=>n.hasChildren&&!n.height,style:{height:"auto"}},{props:{animation:"pulse"},style:E||{animation:`${i} 2s ease-in-out 0.5s infinite`}},{props:{animation:"wave"},style:{position:"relative",overflow:"hidden",WebkitMaskImage:"-webkit-radial-gradient(white, black)","&::after":{background:`linear-gradient(
                90deg,
                transparent,
                ${(t.vars||t).palette.action.hover},
                transparent
              )`,content:'""',position:"absolute",transform:"translateX(-100%)",bottom:0,left:0,right:0,top:0}}},{props:{animation:"wave"},style:K||{"&::after":{animation:`${l} 2s linear 0.5s infinite`}}}]}})),D=v.forwardRef(function(e,a){const n=R({props:e,name:"MuiSkeleton"}),{animation:o="pulse",className:r,component:s="span",height:p,style:m,variant:y="text",width:g,...u}=n,c={...n,animation:o,component:s,variant:y,hasChildren:!!u.children},b=B(c);return C.jsx(N,{as:s,ref:a,className:S(b.root,r),ownerState:c,...u,style:{width:g,height:p,...m}})});function d(t){"@babel/helpers - typeof";return d=typeof Symbol=="function"&&typeof Symbol.iterator=="symbol"?function(e){return typeof e}:function(e){return e&&typeof Symbol=="function"&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},d(t)}export{D as S,d as _};
