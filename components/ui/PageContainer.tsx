import { cn } from '@/lib/utils';

export interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export function PageContainer({ children, className, narrow = false }: PageContainerProps) {
  return (
    <div
      className={cn(
        narrow ? 'amity-container-narrow' : 'amity-container',
        'py-6 pb-10 sm:py-8 sm:pb-14',
        className
      )}
    >
      {children}
    </div>
  );
}
