import{j as e}from"./jsx-runtime-DF2Pcvd1.js";import{r as h}from"./index-B2-qRKKC.js";import{c as A,a as L}from"./utils-BQPBMaRB.js";import{c as u}from"./createLucideIcon-mz0sz0u3.js";import"./_commonjsHelpers-Cpj98o6Y.js";const P=L("relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-content",{variants:{variant:{default:"bg-surface-elevated border-border text-content",destructive:"border-error/50 bg-error-subtle text-error [&>svg]:text-error",success:"border-success/50 bg-success-subtle text-success [&>svg]:text-success",warning:"border-warning/50 bg-warning-subtle text-warning [&>svg]:text-warning",info:"border-info/50 bg-info-subtle text-info [&>svg]:text-info"}},defaultVariants:{variant:"default"}}),r=h.forwardRef(({className:n,variant:a,...l},H)=>e.jsx("div",{ref:H,role:"alert",className:A(P({variant:a}),n),...l}));r.displayName="Alert";const s=h.forwardRef(({className:n,...a},l)=>e.jsx("h5",{ref:l,className:A("mb-1 font-medium leading-none tracking-tight",n),...a}));s.displayName="AlertTitle";const t=h.forwardRef(({className:n,...a},l)=>e.jsx("div",{ref:l,className:A("text-sm [&_p]:leading-relaxed",n),...a}));t.displayName="AlertDescription";r.__docgenInfo={description:"",methods:[],displayName:"Alert"};s.__docgenInfo={description:"",methods:[],displayName:"AlertTitle"};t.__docgenInfo={description:"",methods:[],displayName:"AlertDescription"};/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=u("AlertCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=u("AlertTriangle",[["path",{d:"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z",key:"c3ski4"}],["path",{d:"M12 9v4",key:"juzpu7"}],["path",{d:"M12 17h.01",key:"p32p05"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=u("CheckCircle",[["path",{d:"M22 11.08V12a10 10 0 1 1-5.93-9.14",key:"g774vq"}],["path",{d:"m9 11 3 3L22 4",key:"1pflzl"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const V=u("Info",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"M12 16v-4",key:"1dtifu"}],["path",{d:"M12 8h.01",key:"e9boi3"}]]),B={title:"UI/Alert",component:r,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:"select",options:["default","destructive","success","warning","info"],description:"The visual style variant of the alert"}}},i={render:()=>e.jsxs(r,{className:"w-[400px]",children:[e.jsx(s,{children:"Heads up!"}),e.jsx(t,{children:"You can add components to your app using the CLI."})]})},c={render:()=>e.jsxs(r,{variant:"destructive",className:"w-[400px]",children:[e.jsx(R,{className:"h-4 w-4"}),e.jsx(s,{children:"Error"}),e.jsx(t,{children:"Your session has expired. Please log in again."})]})},o={render:()=>e.jsxs(r,{variant:"success",className:"w-[400px]",children:[e.jsx(M,{className:"h-4 w-4"}),e.jsx(s,{children:"Success"}),e.jsx(t,{children:"Your changes have been saved successfully."})]})},d={render:()=>e.jsxs(r,{variant:"warning",className:"w-[400px]",children:[e.jsx(W,{className:"h-4 w-4"}),e.jsx(s,{children:"Warning"}),e.jsx(t,{children:"Your free trial ends in 3 days. Upgrade now to keep your data."})]})},p={render:()=>e.jsxs(r,{variant:"info",className:"w-[400px]",children:[e.jsx(V,{className:"h-4 w-4"}),e.jsx(s,{children:"Information"}),e.jsx(t,{children:"A new version is available. Refresh to update."})]})},m={render:()=>e.jsxs("div",{className:"flex flex-col gap-4 w-[450px]",children:[e.jsxs(r,{children:[e.jsx(s,{children:"Default"}),e.jsx(t,{children:"This is a default alert message."})]}),e.jsxs(r,{variant:"destructive",children:[e.jsx(R,{className:"h-4 w-4"}),e.jsx(s,{children:"Error"}),e.jsx(t,{children:"Something went wrong."})]}),e.jsxs(r,{variant:"success",children:[e.jsx(M,{className:"h-4 w-4"}),e.jsx(s,{children:"Success"}),e.jsx(t,{children:"Operation completed."})]}),e.jsxs(r,{variant:"warning",children:[e.jsx(W,{className:"h-4 w-4"}),e.jsx(s,{children:"Warning"}),e.jsx(t,{children:"Please review your input."})]}),e.jsxs(r,{variant:"info",children:[e.jsx(V,{className:"h-4 w-4"}),e.jsx(s,{children:"Info"}),e.jsx(t,{children:"Here's some helpful information."})]})]})};var x,g,f;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <Alert className="w-[400px]">
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the CLI.
      </AlertDescription>
    </Alert>
}`,...(f=(g=i.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var v,w,j;c.parameters={...c.parameters,docs:{...(v=c.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <Alert variant="destructive" className="w-[400px]">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
}`,...(j=(w=c.parameters)==null?void 0:w.docs)==null?void 0:j.source}}};var y,N,T;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <Alert variant="success" className="w-[400px]">
      <CheckCircle className="h-4 w-4" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
}`,...(T=(N=o.parameters)==null?void 0:N.docs)==null?void 0:T.source}}};var D,b,k;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <Alert variant="warning" className="w-[400px]">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        Your free trial ends in 3 days. Upgrade now to keep your data.
      </AlertDescription>
    </Alert>
}`,...(k=(b=d.parameters)==null?void 0:b.docs)==null?void 0:k.source}}};var I,C,S;p.parameters={...p.parameters,docs:{...(I=p.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <Alert variant="info" className="w-[400px]">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        A new version is available. Refresh to update.
      </AlertDescription>
    </Alert>
}`,...(S=(C=p.parameters)==null?void 0:C.docs)==null?void 0:S.source}}};var _,Y,E;m.parameters={...m.parameters,docs:{...(_=m.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4 w-[450px]">
      <Alert>
        <AlertTitle>Default</AlertTitle>
        <AlertDescription>This is a default alert message.</AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong.</AlertDescription>
      </Alert>

      <Alert variant="success">
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>Operation completed.</AlertDescription>
      </Alert>

      <Alert variant="warning">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>Please review your input.</AlertDescription>
      </Alert>

      <Alert variant="info">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>Here&apos;s some helpful information.</AlertDescription>
      </Alert>
    </div>
}`,...(E=(Y=m.parameters)==null?void 0:Y.docs)==null?void 0:E.source}}};const F=["Default","Destructive","Success","Warning","InfoAlert","AllVariants"];export{m as AllVariants,i as Default,c as Destructive,p as InfoAlert,o as Success,d as Warning,F as __namedExportsOrder,B as default};
