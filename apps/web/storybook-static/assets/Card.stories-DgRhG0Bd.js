import{j as e}from"./jsx-runtime-DF2Pcvd1.js";import{C as r,a as s,b as n,c as t,d as a,e as x}from"./card-_dE_Rr_C.js";import{B as m}from"./button-Cap4dPvz.js";import{L as p,I as C}from"./label-7OxDckFi.js";import"./index-B2-qRKKC.js";import"./_commonjsHelpers-Cpj98o6Y.js";import"./utils-BQPBMaRB.js";import"./index-DUPqQss3.js";import"./index-kS-9iBlu.js";const M={title:"UI/Card",component:r,parameters:{layout:"centered"},tags:["autodocs"]},d={render:()=>e.jsxs(r,{className:"w-[350px]",children:[e.jsxs(s,{children:[e.jsx(n,{children:"Card Title"}),e.jsx(t,{children:"Card description goes here."})]}),e.jsx(a,{children:e.jsx("p",{children:"Card content area. This is where the main content goes."})}),e.jsx(x,{children:e.jsx(m,{children:"Action"})})]})},c={render:()=>e.jsx(r,{className:"w-[350px]",children:e.jsx(a,{className:"pt-6",children:e.jsx("p",{children:"A simple card with just content."})})})},i={render:()=>e.jsxs(r,{className:"w-[350px]",children:[e.jsxs(s,{children:[e.jsx(n,{children:"Create project"}),e.jsx(t,{children:"Deploy your new project in one-click."})]}),e.jsx(a,{children:e.jsx("form",{children:e.jsxs("div",{className:"grid w-full items-center gap-4",children:[e.jsxs("div",{className:"flex flex-col space-y-1.5",children:[e.jsx(p,{htmlFor:"name",children:"Name"}),e.jsx(C,{id:"name",placeholder:"Name of your project"})]}),e.jsxs("div",{className:"flex flex-col space-y-1.5",children:[e.jsx(p,{htmlFor:"description",children:"Description"}),e.jsx(C,{id:"description",placeholder:"Project description"})]})]})})}),e.jsxs(x,{className:"flex justify-between",children:[e.jsx(m,{variant:"outline",children:"Cancel"}),e.jsx(m,{children:"Deploy"})]})]})},o={render:()=>e.jsxs("div",{className:"grid gap-4 md:grid-cols-3",children:[e.jsxs(r,{children:[e.jsxs(s,{className:"pb-2",children:[e.jsx(t,{children:"Total Projects"}),e.jsx(n,{className:"text-4xl",children:"12"})]}),e.jsx(a,{children:e.jsx("div",{className:"text-xs text-content-secondary",children:"+2 from last month"})})]}),e.jsxs(r,{children:[e.jsxs(s,{className:"pb-2",children:[e.jsx(t,{children:"Active Users"}),e.jsx(n,{className:"text-4xl",children:"573"})]}),e.jsx(a,{children:e.jsx("div",{className:"text-xs text-content-secondary",children:"+201 from last week"})})]}),e.jsxs(r,{children:[e.jsxs(s,{className:"pb-2",children:[e.jsx(t,{children:"Build Time"}),e.jsx(n,{className:"text-4xl",children:"2.4s"})]}),e.jsx(a,{children:e.jsx("div",{className:"text-xs text-content-secondary",children:"-0.3s from average"})})]})]})},l={render:()=>e.jsxs(r,{className:"w-[380px]",children:[e.jsxs(s,{children:[e.jsx(n,{children:"Notifications"}),e.jsx(t,{children:"You have 3 unread messages."})]}),e.jsxs(a,{className:"grid gap-4",children:[e.jsxs("div",{className:"flex items-center space-x-4 rounded-md border border-border p-4",children:[e.jsx("div",{className:"h-2 w-2 rounded-full bg-accent"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"text-sm font-medium leading-none",children:"Push Notifications"}),e.jsx("p",{className:"text-sm text-content-secondary",children:"Send notifications to device."})]})]}),e.jsxs("div",{className:"flex items-center space-x-4 rounded-md border border-border p-4",children:[e.jsx("div",{className:"h-2 w-2 rounded-full bg-secondary"}),e.jsxs("div",{className:"flex-1 space-y-1",children:[e.jsx("p",{className:"text-sm font-medium leading-none",children:"Email Notifications"}),e.jsx("p",{className:"text-sm text-content-secondary",children:"Receive email updates."})]})]})]}),e.jsx(x,{children:e.jsx(m,{className:"w-full",children:"Mark all as read"})})]})};var h,j,N;d.parameters={...d.parameters,docs:{...(h=d.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content area. This is where the main content goes.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
}`,...(N=(j=d.parameters)==null?void 0:j.docs)==null?void 0:N.source}}};var u,f,v;c.parameters={...c.parameters,docs:{...(u=c.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p>A simple card with just content.</p>
      </CardContent>
    </Card>
}`,...(v=(f=c.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var g,y,b;i.parameters={...i.parameters,docs:{...(g=i.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of your project" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Project description" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
}`,...(b=(y=i.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};var w,D,T;o.parameters={...o.parameters,docs:{...(w=o.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Projects</CardDescription>
          <CardTitle className="text-4xl">12</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-content-secondary">+2 from last month</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Active Users</CardDescription>
          <CardTitle className="text-4xl">573</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-content-secondary">+201 from last week</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Build Time</CardDescription>
          <CardTitle className="text-4xl">2.4s</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-content-secondary">-0.3s from average</div>
        </CardContent>
      </Card>
    </div>
}`,...(T=(D=o.parameters)==null?void 0:D.docs)==null?void 0:T.source}}};var F,H,B;l.parameters={...l.parameters,docs:{...(F=l.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: () => <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>You have 3 unread messages.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-4 rounded-md border border-border p-4">
          <div className="h-2 w-2 rounded-full bg-accent" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">Push Notifications</p>
            <p className="text-sm text-content-secondary">Send notifications to device.</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 rounded-md border border-border p-4">
          <div className="h-2 w-2 rounded-full bg-secondary" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">Email Notifications</p>
            <p className="text-sm text-content-secondary">Receive email updates.</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Mark all as read</Button>
      </CardFooter>
    </Card>
}`,...(B=(H=l.parameters)==null?void 0:H.docs)==null?void 0:B.source}}};const W=["Default","Simple","WithForm","Stats","Notification"];export{d as Default,l as Notification,c as Simple,o as Stats,i as WithForm,W as __namedExportsOrder,M as default};
