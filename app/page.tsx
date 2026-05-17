'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Building2,
  FileText,
  LayoutDashboard,
  Lock,
  Settings,
  ShieldAlert,
  Sparkles,
  UserCircle,
  Users,
  Video,
} from 'lucide-react';
import {
  Badge,
  ButtonLink,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageContainer,
  SectionHeader,
} from '@/components/ui';
import { useRole } from '@/components/providers/RoleProvider';
import { getDemoIdentityByRole } from '@/lib/demo-identities';

const adminCards = [
  { icon: LayoutDashboard, title: 'Company dashboard', body: 'Aggregated wellbeing KPIs and recovery adoption.', href: '/admin/dashboard' },
  { icon: Users, title: 'Employees', body: 'High-level team status — never private content.', href: '/admin/employees' },
  { icon: BarChart3, title: 'Analytics', body: 'Anonymized organization trends.', href: '/admin/analytics' },
  { icon: Settings, title: 'Settings', body: 'Privacy, escalation, and integration configuration.', href: '/admin/settings' },
];

const employeeCards = [
  { icon: LayoutDashboard, title: 'My Dashboard', body: 'View your current wellbeing state.', href: '/user/dashboard' },
  { icon: Video, title: 'Recovery', body: 'Start a private AI recovery session.', href: '/user/recovery' },
  { icon: FileText, title: 'My Summary', body: 'Review your recent session recap.', href: '/user/summary' },
  { icon: ShieldAlert, title: 'Crisis Support', body: 'Get immediate support options.', href: '/user/crisis' },
  { icon: UserCircle, title: 'Profile', body: 'Manage personal preferences.', href: '/user/profile' },
];

export default function HomePage() {
  const { role, mounted } = useRole();
  const isAdmin = role === 'admin';
  const identity = getDemoIdentityByRole(role);

  return (
    <PageContainer>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-[var(--amity-border)] bg-[var(--amity-surface)] px-5 py-12 shadow-[var(--amity-shadow-elevated)] sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--amity-glow)] blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <Badge variant="primary" className="mb-5">
            <Sparkles className="mr-1.5 h-3 w-3" aria-hidden />
            {isAdmin ? 'Company wellbeing platform' : 'Personal recovery'}
          </Badge>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-[var(--amity-text)] sm:text-5xl">
            {isAdmin ? 'Company Admin Experience' : 'Employee Recovery Experience'}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--amity-text-muted)] sm:text-lg">
            {isAdmin
              ? 'Monitor privacy-safe wellbeing trends, recovery adoption, and team-level signals. You never see private recovery content.'
              : 'Start a private recovery session, check your personal state, or open crisis support. Everything here is private to you.'}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {isAdmin ? (
              <ButtonLink href="/admin/dashboard" variant="primary" size="lg" fullWidth className="sm:w-auto">
                Open Company Dashboard
                <ArrowRight className="h-4 w-4" aria-hidden />
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/user/recovery" variant="primary" size="lg" fullWidth className="sm:w-auto">
                  <Video className="h-4 w-4" aria-hidden />
                  Start a Private Recovery Call
                </ButtonLink>
                <ButtonLink href="/user/dashboard" variant="secondary" size="lg" fullWidth className="sm:w-auto">
                  View My Dashboard
                </ButtonLink>
              </>
            )}
          </div>
          {!isAdmin && (
            <p className="mt-4 text-xs text-[var(--amity-text-muted)]">
              <Link href="/user/trigger-demo" className="underline underline-offset-2 hover:text-[var(--amity-text)]">
                Open trigger simulation
              </Link>{' '}
              — a demo tool that shows how Amity responds to workplace signals.
            </p>
          )}
          <p className="mt-6 text-xs text-[var(--amity-text-muted)]">
            {mounted
              ? `Viewing as ${identity.name} · ${isAdmin ? 'Company Admin' : 'Employee'} — switch role in the account menu`
              : 'Loading your experience…'}
          </p>
        </div>
      </section>

      {/* Role-specific cards */}
      <section className="mt-12 space-y-6">
        <SectionHeader
          eyebrow={isAdmin ? 'Company tools' : 'Your space'}
          title={isAdmin ? 'Where to start' : 'Quick access'}
          description={
            isAdmin
              ? 'Everything an admin needs — all privacy-safe and aggregated.'
              : 'Your personal recovery features, private to you.'
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(isAdmin ? adminCards : employeeCards).map((c) => (
            <Card key={c.title} variant="default" className="h-full">
              <CardHeader>
                <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--amity-border)] bg-[var(--amity-primary-muted)] text-[var(--amity-primary)]">
                  <c.icon className="h-5 w-5" aria-hidden />
                </span>
                <CardTitle>{c.title}</CardTitle>
                <CardDescription>{c.body}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ButtonLink href={c.href} variant="ghost" size="md" fullWidth>
                  Open
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </ButtonLink>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card variant="soft">
          <CardContent className="flex items-center gap-3">
            {isAdmin ? (
              <Building2 className="h-5 w-5 shrink-0 text-[var(--amity-primary)]" aria-hidden />
            ) : (
              <Lock className="h-5 w-5 shrink-0 text-[var(--amity-primary)]" aria-hidden />
            )}
            <p className="text-sm leading-relaxed text-[var(--amity-text-muted)]">
              {isAdmin
                ? 'Recovery sessions are personal and private — admins only ever see anonymized, aggregated wellbeing signals.'
                : 'Your recovery sessions are private to you. Your employer only ever sees anonymized, aggregated wellbeing signals.'}
            </p>
          </CardContent>
        </Card>
      </section>
    </PageContainer>
  );
}
