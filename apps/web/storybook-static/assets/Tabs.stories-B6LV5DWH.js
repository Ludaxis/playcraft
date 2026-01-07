import{j as e}from"./jsx-runtime-DF2Pcvd1.js";import{R,r as c}from"./index-B2-qRKKC.js";import{c as Y,a as Q,u as be,P as E,b as j,d as ge,e as Ke,f as Ue}from"./index-Bz1TNNQA.js";import{u as $}from"./index-DUPqQss3.js";import{c as q}from"./utils-BQPBMaRB.js";import{C as X,a as Z,b as ee,c as se,d as te}from"./card-_dE_Rr_C.js";import{B as ne}from"./button-Cap4dPvz.js";import{L as M,I as O}from"./label-7OxDckFi.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./index-kS-9iBlu.js";function He(s){const t=s+"CollectionProvider",[a,n]=Y(t),[u,m]=a(t,{collectionRef:{current:null},itemMap:new Map}),i=T=>{const{scope:o,children:b}=T,C=R.useRef(null),d=R.useRef(new Map).current;return e.jsx(u,{scope:o,itemMap:d,collectionRef:C,children:b})};i.displayName=t;const p=s+"CollectionSlot",w=Q(p),v=R.forwardRef((T,o)=>{const{scope:b,children:C}=T,d=m(p,b),f=$(o,d.collectionRef);return e.jsx(w,{ref:f,children:C})});v.displayName=p;const r=s+"CollectionItemSlot",l="data-radix-collection-item",g=Q(r),y=R.forwardRef((T,o)=>{const{scope:b,children:C,...d}=T,f=R.useRef(null),S=$(o,f),F=m(r,b);return R.useEffect(()=>(F.itemMap.set(f,{ref:f,...d}),()=>void F.itemMap.delete(f))),e.jsx(g,{[l]:"",ref:S,children:C})});y.displayName=r;function A(T){const o=m(s+"CollectionConsumer",T);return R.useCallback(()=>{const C=o.collectionRef.current;if(!C)return[];const d=Array.from(C.querySelectorAll(`[${l}]`));return Array.from(o.itemMap.values()).sort((F,L)=>d.indexOf(F.ref.current)-d.indexOf(L.ref.current))},[o.collectionRef,o.itemMap])}return[{Provider:i,Slot:v,ItemSlot:y},A,n]}var $e=c.createContext(void 0);function he(s){const t=c.useContext($e);return s||t||"ltr"}var H="rovingFocusGroup.onEntryFocus",ze={bubbles:!1,cancelable:!0},D="RovingFocusGroup",[z,xe,Ye]=He(D),[qe,Te]=Y(D,[Ye]),[Je,We]=qe(D),Ce=c.forwardRef((s,t)=>e.jsx(z.Provider,{scope:s.__scopeRovingFocusGroup,children:e.jsx(z.Slot,{scope:s.__scopeRovingFocusGroup,children:e.jsx(Qe,{...s,ref:t})})}));Ce.displayName=D;var Qe=c.forwardRef((s,t)=>{const{__scopeRovingFocusGroup:a,orientation:n,loop:u=!1,dir:m,currentTabStopId:i,defaultCurrentTabStopId:p,onCurrentTabStopIdChange:w,onEntryFocus:v,preventScrollOnEntryFocus:r=!1,...l}=s,g=c.useRef(null),y=$(t,g),A=he(m),[T,o]=ge({prop:i,defaultProp:p??null,onChange:w,caller:D}),[b,C]=c.useState(!1),d=Ke(v),f=xe(a),S=c.useRef(!1),[F,L]=c.useState(0);return c.useEffect(()=>{const h=g.current;if(h)return h.addEventListener(H,d),()=>h.removeEventListener(H,d)},[d]),e.jsx(Je,{scope:a,orientation:n,dir:A,loop:u,currentTabStopId:T,onItemFocus:c.useCallback(h=>o(h),[o]),onItemShiftTab:c.useCallback(()=>C(!0),[]),onFocusableItemAdd:c.useCallback(()=>L(h=>h+1),[]),onFocusableItemRemove:c.useCallback(()=>L(h=>h-1),[]),children:e.jsx(E.div,{tabIndex:b||F===0?-1:0,"data-orientation":n,...l,ref:y,style:{outline:"none",...s.style},onMouseDown:j(s.onMouseDown,()=>{S.current=!0}),onFocus:j(s.onFocus,h=>{const Ve=!S.current;if(h.target===h.currentTarget&&Ve&&!b){const W=new CustomEvent(H,ze);if(h.currentTarget.dispatchEvent(W),!W.defaultPrevented){const U=f().filter(I=>I.focusable),Ge=U.find(I=>I.active),ke=U.find(I=>I.id===T),Be=[Ge,ke,...U].filter(Boolean).map(I=>I.ref.current);je(Be,r)}}S.current=!1}),onBlur:j(s.onBlur,()=>C(!1))})})}),Ne="RovingFocusGroupItem",we=c.forwardRef((s,t)=>{const{__scopeRovingFocusGroup:a,focusable:n=!0,active:u=!1,tabStopId:m,children:i,...p}=s,w=be(),v=m||w,r=We(Ne,a),l=r.currentTabStopId===v,g=xe(a),{onFocusableItemAdd:y,onFocusableItemRemove:A,currentTabStopId:T}=r;return c.useEffect(()=>{if(n)return y(),()=>A()},[n,y,A]),e.jsx(z.ItemSlot,{scope:a,id:v,focusable:n,active:u,children:e.jsx(E.span,{tabIndex:l?0:-1,"data-orientation":r.orientation,...p,ref:t,onMouseDown:j(s.onMouseDown,o=>{n?r.onItemFocus(v):o.preventDefault()}),onFocus:j(s.onFocus,()=>r.onItemFocus(v)),onKeyDown:j(s.onKeyDown,o=>{if(o.key==="Tab"&&o.shiftKey){r.onItemShiftTab();return}if(o.target!==o.currentTarget)return;const b=es(o,r.orientation,r.dir);if(b!==void 0){if(o.metaKey||o.ctrlKey||o.altKey||o.shiftKey)return;o.preventDefault();let d=g().filter(f=>f.focusable).map(f=>f.ref.current);if(b==="last")d.reverse();else if(b==="prev"||b==="next"){b==="prev"&&d.reverse();const f=d.indexOf(o.currentTarget);d=r.loop?ss(d,f+1):d.slice(f+1)}setTimeout(()=>je(d))}}),children:typeof i=="function"?i({isCurrentTabStop:l,hasTabStop:T!=null}):i})})});we.displayName=Ne;var Xe={ArrowLeft:"prev",ArrowUp:"prev",ArrowRight:"next",ArrowDown:"next",PageUp:"first",Home:"first",PageDown:"last",End:"last"};function Ze(s,t){return t!=="rtl"?s:s==="ArrowLeft"?"ArrowRight":s==="ArrowRight"?"ArrowLeft":s}function es(s,t,a){const n=Ze(s.key,a);if(!(t==="vertical"&&["ArrowLeft","ArrowRight"].includes(n))&&!(t==="horizontal"&&["ArrowUp","ArrowDown"].includes(n)))return Xe[n]}function je(s,t=!1){const a=document.activeElement;for(const n of s)if(n===a||(n.focus({preventScroll:t}),document.activeElement!==a))return}function ss(s,t){return s.map((a,n)=>s[(t+n)%s.length])}var ts=Ce,ns=we,K="Tabs",[as]=Y(K,[Te]),ye=Te(),[rs,J]=as(K),Ie=c.forwardRef((s,t)=>{const{__scopeTabs:a,value:n,onValueChange:u,defaultValue:m,orientation:i="horizontal",dir:p,activationMode:w="automatic",...v}=s,r=he(p),[l,g]=ge({prop:n,onChange:u,defaultProp:m??"",caller:K});return e.jsx(rs,{scope:a,baseId:be(),value:l,onValueChange:g,orientation:i,dir:r,activationMode:w,children:e.jsx(E.div,{dir:r,"data-orientation":i,...v,ref:t})})});Ie.displayName=K;var Re="TabsList",Ae=c.forwardRef((s,t)=>{const{__scopeTabs:a,loop:n=!0,...u}=s,m=J(Re,a),i=ye(a);return e.jsx(ts,{asChild:!0,...i,orientation:m.orientation,dir:m.dir,loop:n,children:e.jsx(E.div,{role:"tablist","aria-orientation":m.orientation,...u,ref:t})})});Ae.displayName=Re;var Se="TabsTrigger",Fe=c.forwardRef((s,t)=>{const{__scopeTabs:a,value:n,disabled:u=!1,...m}=s,i=J(Se,a),p=ye(a),w=De(i.baseId,n),v=Pe(i.baseId,n),r=n===i.value;return e.jsx(ns,{asChild:!0,...p,focusable:!u,active:r,children:e.jsx(E.button,{type:"button",role:"tab","aria-selected":r,"aria-controls":v,"data-state":r?"active":"inactive","data-disabled":u?"":void 0,disabled:u,id:w,...m,ref:t,onMouseDown:j(s.onMouseDown,l=>{!u&&l.button===0&&l.ctrlKey===!1?i.onValueChange(n):l.preventDefault()}),onKeyDown:j(s.onKeyDown,l=>{[" ","Enter"].includes(l.key)&&i.onValueChange(n)}),onFocus:j(s.onFocus,()=>{const l=i.activationMode!=="manual";!r&&!u&&l&&i.onValueChange(n)})})})});Fe.displayName=Se;var Ee="TabsContent",_e=c.forwardRef((s,t)=>{const{__scopeTabs:a,value:n,forceMount:u,children:m,...i}=s,p=J(Ee,a),w=De(p.baseId,n),v=Pe(p.baseId,n),r=n===p.value,l=c.useRef(r);return c.useEffect(()=>{const g=requestAnimationFrame(()=>l.current=!1);return()=>cancelAnimationFrame(g)},[]),e.jsx(Ue,{present:u||r,children:({present:g})=>e.jsx(E.div,{"data-state":r?"active":"inactive","data-orientation":p.orientation,role:"tabpanel","aria-labelledby":w,hidden:!g,id:v,tabIndex:0,...i,ref:t,style:{...s.style,animationDuration:l.current?"0s":void 0},children:g&&m})})});_e.displayName=Ee;function De(s,t){return`${s}-trigger-${t}`}function Pe(s,t){return`${s}-content-${t}`}var os=Ie,Le=Ae,Me=Fe,Oe=_e;const P=os,_=c.forwardRef(({className:s,...t},a)=>e.jsx(Le,{ref:a,className:q("inline-flex h-10 items-center justify-center rounded-lg bg-surface-muted p-1 text-content-secondary",s),...t}));_.displayName=Le.displayName;const x=c.forwardRef(({className:s,...t},a)=>e.jsx(Me,{ref:a,className:q("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-surface transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-surface-elevated data-[state=active]:text-content data-[state=active]:shadow-sm",s),...t}));x.displayName=Me.displayName;const N=c.forwardRef(({className:s,...t},a)=>e.jsx(Oe,{ref:a,className:q("mt-2 ring-offset-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",s),...t}));N.displayName=Oe.displayName;_.__docgenInfo={description:"",methods:[]};x.__docgenInfo={description:"",methods:[]};N.__docgenInfo={description:"",methods:[]};const hs={title:"UI/Tabs",component:P,parameters:{layout:"centered"},tags:["autodocs"]},V={render:()=>e.jsxs(P,{defaultValue:"account",className:"w-[400px]",children:[e.jsxs(_,{className:"grid w-full grid-cols-2",children:[e.jsx(x,{value:"account",children:"Account"}),e.jsx(x,{value:"password",children:"Password"})]}),e.jsx(N,{value:"account",children:e.jsxs(X,{children:[e.jsxs(Z,{children:[e.jsx(ee,{children:"Account"}),e.jsx(se,{children:"Make changes to your account here. Click save when you're done."})]}),e.jsxs(te,{className:"space-y-2",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(M,{htmlFor:"name",children:"Name"}),e.jsx(O,{id:"name",defaultValue:"John Doe"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(M,{htmlFor:"username",children:"Username"}),e.jsx(O,{id:"username",defaultValue:"@johndoe"})]})]})]})}),e.jsx(N,{value:"password",children:e.jsxs(X,{children:[e.jsxs(Z,{children:[e.jsx(ee,{children:"Password"}),e.jsx(se,{children:"Change your password here. After saving, you'll be logged out."})]}),e.jsxs(te,{className:"space-y-2",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(M,{htmlFor:"current",children:"Current password"}),e.jsx(O,{id:"current",type:"password"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(M,{htmlFor:"new",children:"New password"}),e.jsx(O,{id:"new",type:"password"})]})]})]})})]})},G={render:()=>e.jsxs(P,{defaultValue:"overview",className:"w-[400px]",children:[e.jsxs(_,{children:[e.jsx(x,{value:"overview",children:"Overview"}),e.jsx(x,{value:"analytics",children:"Analytics"}),e.jsx(x,{value:"reports",children:"Reports"})]}),e.jsxs(N,{value:"overview",className:"p-4",children:[e.jsx("h3",{className:"text-lg font-medium",children:"Overview"}),e.jsx("p",{className:"text-content-secondary",children:"Your project overview and summary statistics."})]}),e.jsxs(N,{value:"analytics",className:"p-4",children:[e.jsx("h3",{className:"text-lg font-medium",children:"Analytics"}),e.jsx("p",{className:"text-content-secondary",children:"Detailed analytics and usage metrics."})]}),e.jsxs(N,{value:"reports",className:"p-4",children:[e.jsx("h3",{className:"text-lg font-medium",children:"Reports"}),e.jsx("p",{className:"text-content-secondary",children:"Generate and download reports."})]})]})},k={render:()=>e.jsxs(P,{defaultValue:"code",className:"w-[500px]",children:[e.jsxs(_,{className:"grid w-full grid-cols-3",children:[e.jsxs(x,{value:"code",children:[e.jsx("span",{className:"mr-2",children:"📝"}),"Code"]}),e.jsxs(x,{value:"preview",children:[e.jsx("span",{className:"mr-2",children:"👁️"}),"Preview"]}),e.jsxs(x,{value:"settings",children:[e.jsx("span",{className:"mr-2",children:"⚙️"}),"Settings"]})]}),e.jsx(N,{value:"code",className:"p-4 border border-border rounded-lg mt-2",children:e.jsx("pre",{className:"text-sm font-mono bg-surface-muted p-4 rounded",children:`function hello() {
  console.log("Hello!");
}`})}),e.jsx(N,{value:"preview",className:"p-4 border border-border rounded-lg mt-2",children:e.jsx("div",{className:"text-center py-8",children:e.jsx("p",{className:"text-content-secondary",children:"Preview will appear here"})})}),e.jsx(N,{value:"settings",className:"p-4 border border-border rounded-lg mt-2",children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{children:"Auto-save"}),e.jsx(ne,{variant:"outline",size:"sm",children:"Enable"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{children:"Dark mode"}),e.jsx(ne,{variant:"outline",size:"sm",children:"Toggle"})]})]})})]})},B={render:()=>e.jsxs(P,{defaultValue:"active",className:"w-[400px]",children:[e.jsxs(_,{children:[e.jsx(x,{value:"active",children:"Active"}),e.jsx(x,{value:"disabled",disabled:!0,children:"Disabled"}),e.jsx(x,{value:"another",children:"Another"})]}),e.jsx(N,{value:"active",className:"p-4",children:"This tab is active."}),e.jsx(N,{value:"another",className:"p-4",children:"This is another tab."})]})};var ae,re,oe;V.parameters={...V.parameters,docs:{...(ae=V.parameters)==null?void 0:ae.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you&apos;re done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@johndoe" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="password">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you&apos;ll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
}`,...(oe=(re=V.parameters)==null?void 0:re.docs)==null?void 0:oe.source}}};var ce,ie,le;G.parameters={...G.parameters,docs:{...(ce=G.parameters)==null?void 0:ce.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-4">
        <h3 className="text-lg font-medium">Overview</h3>
        <p className="text-content-secondary">
          Your project overview and summary statistics.
        </p>
      </TabsContent>
      <TabsContent value="analytics" className="p-4">
        <h3 className="text-lg font-medium">Analytics</h3>
        <p className="text-content-secondary">
          Detailed analytics and usage metrics.
        </p>
      </TabsContent>
      <TabsContent value="reports" className="p-4">
        <h3 className="text-lg font-medium">Reports</h3>
        <p className="text-content-secondary">
          Generate and download reports.
        </p>
      </TabsContent>
    </Tabs>
}`,...(le=(ie=G.parameters)==null?void 0:ie.docs)==null?void 0:le.source}}};var de,ue,me;k.parameters={...k.parameters,docs:{...(de=k.parameters)==null?void 0:de.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="code" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="code">
          <span className="mr-2">📝</span>
          Code
        </TabsTrigger>
        <TabsTrigger value="preview">
          <span className="mr-2">👁️</span>
          Preview
        </TabsTrigger>
        <TabsTrigger value="settings">
          <span className="mr-2">⚙️</span>
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="code" className="p-4 border border-border rounded-lg mt-2">
        <pre className="text-sm font-mono bg-surface-muted p-4 rounded">
          {\`function hello() {
  console.log("Hello!");
}\`}
        </pre>
      </TabsContent>
      <TabsContent value="preview" className="p-4 border border-border rounded-lg mt-2">
        <div className="text-center py-8">
          <p className="text-content-secondary">Preview will appear here</p>
        </div>
      </TabsContent>
      <TabsContent value="settings" className="p-4 border border-border rounded-lg mt-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Auto-save</span>
            <Button variant="outline" size="sm">Enable</Button>
          </div>
          <div className="flex items-center justify-between">
            <span>Dark mode</span>
            <Button variant="outline" size="sm">Toggle</Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
}`,...(me=(ue=k.parameters)==null?void 0:ue.docs)==null?void 0:me.source}}};var pe,fe,ve;B.parameters={...B.parameters,docs:{...(pe=B.parameters)==null?void 0:pe.docs,source:{originalSource:`{
  render: () => <Tabs defaultValue="active" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="another">Another</TabsTrigger>
      </TabsList>
      <TabsContent value="active" className="p-4">
        This tab is active.
      </TabsContent>
      <TabsContent value="another" className="p-4">
        This is another tab.
      </TabsContent>
    </Tabs>
}`,...(ve=(fe=B.parameters)==null?void 0:fe.docs)==null?void 0:ve.source}}};const xs=["Default","Simple","WithIcons","Disabled"];export{V as Default,B as Disabled,G as Simple,k as WithIcons,xs as __namedExportsOrder,hs as default};
