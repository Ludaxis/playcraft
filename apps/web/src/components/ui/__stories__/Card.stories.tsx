import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
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
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardContent className="pt-6">
        <p>A simple card with just content.</p>
      </CardContent>
    </Card>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Card className="w-[350px]">
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
  ),
};

export const Stats: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
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
  ),
};

export const Notification: Story = {
  render: () => (
    <Card className="w-[380px]">
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
  ),
};
