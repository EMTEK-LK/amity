import { Header } from './Header';
import { ThemeProvider } from './ThemeProvider';
import { RoleProvider } from '@/components/providers/RoleProvider';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <ThemeProvider>
      <RoleProvider>
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[var(--amity-border)] bg-[var(--amity-surface)]/50 py-6">
            <div className="amity-container">
              <p className="text-center text-xs leading-relaxed text-[var(--amity-text-muted)]">
                Amity — workplace emotional recovery support. Not a medical or therapy product.
              </p>
            </div>
          </footer>
        </div>
      </RoleProvider>
    </ThemeProvider>
  );
}
