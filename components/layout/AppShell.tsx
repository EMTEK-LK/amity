import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-[var(--color-amity-border)]/40 py-6">
        <div className="amity-container">
          <p className="text-center text-xs text-[var(--color-amity-muted)]">
            Amity — workplace emotional recovery support. Not a medical or therapy product.
          </p>
        </div>
      </footer>
    </div>
  );
}
