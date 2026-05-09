import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { allProjects } from "@/content/projects";

function ProjectCardStory() {
  const project = allProjects[0];
  return (
    <Card className="max-w-sm overflow-hidden">
      <div className="aspect-16/10 bg-cyber-grid bg-muted" />
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{project.shortPitch}</CardContent>
    </Card>
  );
}

const meta = {
  title: "cards/ProjectCard",
  component: ProjectCardStory,
} satisfies Meta<typeof ProjectCardStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
