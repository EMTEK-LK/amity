import { Building2, User } from 'lucide-react';
import {
  ButtonLink,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageContainer,
  SectionHeader,
} from '@/components/ui';

export default function SummaryChooserPage() {
  return (
    <PageContainer>
      <SectionHeader
        eyebrow="Summary"
        title="Which summary?"
        description="Summaries are role-specific. Employees see a private before/after recap; admins see a privacy-safe company recap."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card variant="elevated">
          <CardHeader>
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]">
              <User className="h-5 w-5" aria-hidden />
            </span>
            <CardTitle>My recovery summary</CardTitle>
            <CardDescription>Private before/after recap for the employee.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ButtonLink href="/user/summary" variant="primary" size="lg" fullWidth>
              Open my summary
            </ButtonLink>
          </CardContent>
        </Card>

        <Card variant="default">
          <CardHeader>
            <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-bg-subtle)] text-[var(--amity-primary)]">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            <CardTitle>Company wellbeing summary</CardTitle>
            <CardDescription>Aggregated, privacy-safe recap for admins.</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ButtonLink href="/admin/summary" variant="secondary" size="lg" fullWidth>
              Open company summary
            </ButtonLink>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
