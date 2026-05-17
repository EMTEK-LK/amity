import {
  Calendar,
  Hand,
  Mic,
  Moon,
  Phone,
  Presentation,
  ShieldAlert,
  TrendingDown,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react';
import type { TriggerIconKey } from '@/types/trigger';

const ICON_MAP: Record<TriggerIconKey, LucideIcon> = {
  users: Users,
  phone: Phone,
  calendar: Calendar,
  presentation: Presentation,
  moon: Moon,
  trending_down: TrendingDown,
  hand: Hand,
  mic: Mic,
  video: Video,
  shield_alert: ShieldAlert,
};

export function TriggerIcon({
  iconKey,
  className,
}: {
  iconKey: TriggerIconKey;
  className?: string;
}) {
  const Icon = ICON_MAP[iconKey];
  return <Icon className={className} aria-hidden />;
}
