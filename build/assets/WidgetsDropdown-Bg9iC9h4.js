import{r as a,u as y,j as r,e as w,f as C,ar as k,as as j,at as v,N as b}from"./index-gQmVmy0g.js";/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=t=>t.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),A=t=>t.replace(/^([A-Z])|[\s-_]+(\w)/g,(e,s,o)=>o?o.toUpperCase():s.toLowerCase()),g=t=>{const e=A(t);return e.charAt(0).toUpperCase()+e.slice(1)},h=(...t)=>t.filter((e,s,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===s).join(" ").trim(),L=t=>{for(const e in t)if(e.startsWith("aria-")||e==="role"||e==="title")return!0};/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var R={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _=a.forwardRef(({color:t="currentColor",size:e=24,strokeWidth:s=2,absoluteStrokeWidth:o,className:d="",children:i,iconNode:u,...p},f)=>a.createElement("svg",{ref:f,...R,width:e,height:e,stroke:t,strokeWidth:o?Number(s)*24/Number(e):s,className:h("lucide",d),...!i&&!L(p)&&{"aria-hidden":"true"},...p},[...u.map(([l,c])=>a.createElement(l,c)),...Array.isArray(i)?i:[i]]));/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=(t,e)=>{const s=a.forwardRef(({className:o,...d},i)=>a.createElement(_,{ref:i,iconNode:e,className:h(`lucide-${T(g(t))}`,`lucide-${t}`,o),...d}));return s.displayName=g(t),s};/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]],M=m("arrow-right",E);/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=[["path",{d:"M16 17h6v-6",key:"t6n2it"}],["path",{d:"m22 17-8.5-8.5-5 5L2 7",key:"x473p"}]],I=m("trending-down",D);/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["path",{d:"M16 7h6v6",key:"box55l"}],["path",{d:"m22 7-8.5 8.5-5-5L2 17",key:"1t1m79"}]],S=m("trending-up",N),U=({className:t})=>{const[e,s]=a.useState(0),[o,d]=a.useState(0),[i,u]=a.useState(0),p=y();a.useEffect(()=>{(async()=>{try{const c=await k(),n=await j(),x=await v();s(c),d(n),u(x)}catch(c){console.error(c)}})()},[]);const f=[{title:"Total Users",total:e,trend:"up",link:"/users"},{title:"Active Jobs",total:87,trend:"down",link:"/jobs"},{title:"Total Recruiters",total:o,trend:"up",link:"/recruiters"},{title:"Active Candidates",total:i,trend:"down",link:"/candidates"}];return r.jsx(w,{className:t,xs:{gutter:3},children:f.map((l,c)=>r.jsx(C,{xs:12,sm:6,md:4,xl:3,children:r.jsxs("div",{style:{borderRadius:"0.25rem",border:"1px solid #d1d5db",display:"flex",flexDirection:"column",justifyContent:"space-between",minHeight:"140px",backgroundColor:"#fff",overflow:"hidden",transition:"transform 0.2s"},onMouseEnter:n=>n.currentTarget.style.transform="translateY(-2px)",onMouseLeave:n=>n.currentTarget.style.transform="translateY(0px)",children:[r.jsxs("div",{style:{padding:"0.8rem 1rem",flexGrow:1,display:"flex",flexDirection:"column",gap:"0.2rem"},children:[r.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.25rem",flexWrap:"wrap"},children:[r.jsx("div",{style:{fontSize:"1.4rem",fontWeight:600,fontFamily:"Inter, sans-serif"},children:l.total.toLocaleString()}),l.trend==="up"?r.jsx(S,{color:"green",size:18}):r.jsx(I,{color:"red",size:18})]}),r.jsx("div",{style:{fontSize:"0.75rem",color:"#6B7280",fontFamily:"Inter, sans-serif",marginTop:"2px"},children:l.title})]}),r.jsxs("div",{onClick:()=>p(l.link),style:{backgroundColor:"#2759a7",color:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0.8rem",cursor:"pointer",fontWeight:500,fontSize:"0.8rem",fontFamily:"Inter, sans-serif",transition:"background-color 0.2s"},onMouseEnter:n=>n.currentTarget.style.backgroundColor="#1f477d",onMouseLeave:n=>n.currentTarget.style.backgroundColor="#2759a7",children:[r.jsx("span",{children:"View More"}),r.jsx(M,{size:14,color:"#fff"})]})]})},c))})};U.propTypes={className:b.string};export{U as W};
