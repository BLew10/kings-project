import { Badge } from "@/components/ui/badge";

type SubjectHeaderProps = {
  subject: string;
  description: string;
  badge: string;
};

export function SubjectHeader({ subject, description, badge }: SubjectHeaderProps) {
  return (
    <section className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Now viewing</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{subject}</h2>
        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{description}</p>
      </div>
      <Badge variant="outline" className="px-3 py-1 text-sm">
        {badge}
      </Badge>
    </section>
  );
}
