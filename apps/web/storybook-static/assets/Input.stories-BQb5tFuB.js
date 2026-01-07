import{j as e}from"./jsx-runtime-DF2Pcvd1.js";import{I as r,L as X}from"./label-7OxDckFi.js";import"./index-B2-qRKKC.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./utils-BQPBMaRB.js";import"./index-kS-9iBlu.js";import"./index-DUPqQss3.js";const te={title:"UI/Input",component:r,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{type:{control:"select",options:["text","email","password","number","search","tel","url"],description:"The input type"},placeholder:{control:"text",description:"Placeholder text"},disabled:{control:"boolean",description:"Whether the input is disabled"},error:{control:"boolean",description:"Whether the input has an error"}}},a={args:{placeholder:"Enter text..."}},s={render:()=>e.jsxs("div",{className:"grid w-full max-w-sm items-center gap-1.5",children:[e.jsx(X,{htmlFor:"email",children:"Email"}),e.jsx(r,{type:"email",id:"email",placeholder:"Email"})]})},t={args:{type:"password",placeholder:"Enter password..."}},l={args:{defaultValue:"user@example.com",type:"email"}},o={args:{placeholder:"Disabled input",disabled:!0}},d={args:{defaultValue:"Cannot edit this",disabled:!0}},n={args:{placeholder:"Enter email...",error:!0,defaultValue:"invalid-email"}},i={render:()=>e.jsxs("div",{className:"grid w-full max-w-sm items-center gap-1.5",children:[e.jsx(X,{htmlFor:"email-error",children:"Email"}),e.jsx(r,{type:"email",id:"email-error",placeholder:"Email",error:!0,defaultValue:"invalid","aria-describedby":"email-error-message"}),e.jsx("p",{id:"email-error-message",className:"text-sm text-error",children:"Please enter a valid email address."})]})},c={args:{type:"search",placeholder:"Search..."}},m={args:{type:"number",placeholder:"Enter number..."}},p={args:{type:"file"}},u={render:()=>e.jsxs("div",{className:"flex flex-col gap-4 w-64",children:[e.jsx(r,{placeholder:"Default"}),e.jsx(r,{placeholder:"With value",defaultValue:"Some text"}),e.jsx(r,{placeholder:"Disabled",disabled:!0}),e.jsx(r,{placeholder:"Error state",error:!0})]})};var h,g,x;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    placeholder: 'Enter text...'
  }
}`,...(x=(g=a.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};var b,f,E;s.parameters={...s.parameters,docs:{...(b=s.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Email" />
    </div>
}`,...(E=(f=s.parameters)==null?void 0:f.docs)==null?void 0:E.source}}};var y,S,v;t.parameters={...t.parameters,docs:{...(y=t.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    type: 'password',
    placeholder: 'Enter password...'
  }
}`,...(v=(S=t.parameters)==null?void 0:S.docs)==null?void 0:v.source}}};var w,j,V;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    defaultValue: 'user@example.com',
    type: 'email'
  }
}`,...(V=(j=l.parameters)==null?void 0:j.docs)==null?void 0:V.source}}};var D,W,I;o.parameters={...o.parameters,docs:{...(D=o.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    placeholder: 'Disabled input',
    disabled: true
  }
}`,...(I=(W=o.parameters)==null?void 0:W.docs)==null?void 0:I.source}}};var N,L,F;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    defaultValue: 'Cannot edit this',
    disabled: true
  }
}`,...(F=(L=d.parameters)==null?void 0:L.docs)==null?void 0:F.source}}};var P,A,C;n.parameters={...n.parameters,docs:{...(P=n.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    placeholder: 'Enter email...',
    error: true,
    defaultValue: 'invalid-email'
  }
}`,...(C=(A=n.parameters)==null?void 0:A.docs)==null?void 0:C.source}}};var M,T,_;i.parameters={...i.parameters,docs:{...(M=i.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: () => <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email-error">Email</Label>
      <Input type="email" id="email-error" placeholder="Email" error defaultValue="invalid" aria-describedby="email-error-message" />
      <p id="email-error-message" className="text-sm text-error">
        Please enter a valid email address.
      </p>
    </div>
}`,...(_=(T=i.parameters)==null?void 0:T.docs)==null?void 0:_.source}}};var O,R,U;c.parameters={...c.parameters,docs:{...(O=c.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    type: 'search',
    placeholder: 'Search...'
  }
}`,...(U=(R=c.parameters)==null?void 0:R.docs)==null?void 0:U.source}}};var k,q,z;m.parameters={...m.parameters,docs:{...(k=m.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    type: 'number',
    placeholder: 'Enter number...'
  }
}`,...(z=(q=m.parameters)==null?void 0:q.docs)==null?void 0:z.source}}};var B,G,H;p.parameters={...p.parameters,docs:{...(B=p.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    type: 'file'
  }
}`,...(H=(G=p.parameters)==null?void 0:G.docs)==null?void 0:H.source}}};var J,K,Q;u.parameters={...u.parameters,docs:{...(J=u.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4 w-64">
      <Input placeholder="Default" />
      <Input placeholder="With value" defaultValue="Some text" />
      <Input placeholder="Disabled" disabled />
      <Input placeholder="Error state" error />
    </div>
}`,...(Q=(K=u.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};const le=["Default","WithLabel","Password","WithValue","Disabled","DisabledWithValue","Error","WithErrorMessage","Search","Number","File","AllStates"];export{u as AllStates,a as Default,o as Disabled,d as DisabledWithValue,n as Error,p as File,m as Number,t as Password,c as Search,i as WithErrorMessage,s as WithLabel,l as WithValue,le as __namedExportsOrder,te as default};
