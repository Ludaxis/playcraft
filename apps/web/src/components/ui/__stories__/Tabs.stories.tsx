import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
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
  ),
};

export const Simple: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
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
  ),
};

export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="code" className="w-[500px]">
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
          {`function hello() {
  console.log("Hello!");
}`}
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
  ),
};

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="active" className="w-[400px]">
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
  ),
};
