// [build] library: 'shadcn'
import { FontItalicIcon, FontBoldIcon } from "@radix-ui/react-icons";
import { Toggle } from "../components/ui/toggle";
import { Meta, StoryObj } from "@storybook/react";

type ToggleProps = React.ComponentProps<typeof Toggle>;

const meta: Meta<ToggleProps> = {
  title: "ui/Toggle",
  component: Toggle,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ['default', 'outline', 'destructive'],
      control: { type: 'select' }
    },
    size: {
      options: ['default', 'sm', 'lg'],
      control: { type: 'select' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  },
};
export default meta;

type Story = StoryObj<ToggleProps>;

export const Default = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <FontBoldIcon className="h-4 w-4" />
    </Toggle>
  ),
  args: {},
};

export const Outline = {
  render: () => (
    <Toggle aria-label="Toggle italic" variant="outline">
      <FontItalicIcon className="h-4 w-4" />
    </Toggle>
  ),
  args: {},
};

export const WithText = {
  render: () => (
    <Toggle aria-label="Toggle italic">
      <FontItalicIcon className="h-4 w-4" />
      Italic
    </Toggle>
  ),
  args: {},
};

export const Small = {
  render: () => (
    <Toggle size="sm" aria-label="Toggle bold">
      <FontBoldIcon className="h-4 w-4" />
    </Toggle>
  ),
  args: {},
};

export const Large = {
  render: () => (
    <Toggle size="lg" aria-label="Toggle bold">
      <FontBoldIcon className="h-4 w-4" />
    </Toggle>
  ),
  args: {},
};

export const Destructive = {
  render: () => (
    <Toggle aria-label="Toggle bold" disabled>
      <FontBoldIcon className="h-4 w-4" />
    </Toggle>
  ),
  args: {
    variant: "destructive",
  },
};
