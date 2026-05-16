'use client';

import { Building2 } from 'lucide-react';
import { useRole } from '@/components/providers/RoleProvider';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { PageContainer } from '@/components/ui/PageContainer';

/**
 * Lightweight demo gate (not real auth). If the employee role is selected,
 * admin areas show a polished switch prompt instead of company data.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, setRole, mounted } = useRole();

  if (mounted && role !== 'admin') {
    return (
      <PageContainer narrow>
        <Card variant="elevated" className="mt-10">
          <CardHeader>
            <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--amity-border)] bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]">
              <Building2 className="h-6 w-6" aria-hidden />
            </span>
            <CardTitle>Company Admin area</CardTitle>
            <CardDescription>
              This is a privacy-safe company view. Switch to the Company Admin role to
              explore this demo area.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setRole('admin')}
            >
              Switch to Company Admin view
            </Button>
            <p className="mt-3 text-center text-xs text-[var(--amity-text-muted)]">
              Demo role switch — no real sign-in.
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return <>{children}</>;
}
