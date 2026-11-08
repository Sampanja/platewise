import {
  ArrowRight,
  ArrowUpDown,
  BookOpen,
  CalendarDays,
  Camera,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  CookingPot,
  Copy,
  Crown,
  FileText,
  Flame,
  Heart,
  House,
  Images,
  Info,
  Leaf,
  ListChecks,
  Lock,
  LockOpen,
  Minus,
  NotebookPen,
  Pencil,
  PiggyBank,
  Plus,
  RefreshCw,
  RotateCcw,
  ScanLine,
  Search,
  Share2,
  Shield,
  ShoppingBasket,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Store,
  Target,
  Trash,
  User,
  Users,
  Utensils,
  Vibrate,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import { colors, type ColorToken } from '@/theme';

/**
 * One consistent line icon set (Lucide, 24 × 24 grid, round caps). Decorative
 * by default (hidden from screen readers): the surrounding control carries
 * the accessible label.
 */
const ICONS = {
  home: House,
  recipes: BookOpen,
  plus: Plus,
  minus: Minus,
  diary: NotebookPen,
  profile: User,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  arrowRight: ArrowRight,
  plate: Utensils,
  savings: PiggyBank,
  wallet: Wallet,
  alert: Info,
  info: Info,
  clock: Clock,
  flame: Flame,
  heart: Heart,
  search: Search,
  filter: SlidersHorizontal,
  sort: ArrowUpDown,
  close: X,
  check: Check,
  checkCircle: CircleCheck,
  lock: Lock,
  unlock: LockOpen,
  swap: RefreshCw,
  shuffle: Shuffle,
  basket: ShoppingBasket,
  camera: Camera,
  gallery: Images,
  scan: ScanLine,
  share: Share2,
  copy: Copy,
  sparkles: Sparkles,
  store: Store,
  users: Users,
  leaf: Leaf,
  pencil: Pencil,
  undo: RotateCcw,
  trash: Trash,
  calendar: CalendarDays,
  chart: ChartColumn,
  crown: Crown,
  shield: Shield,
  file: FileText,
  vibrate: Vibrate,
  target: Target,
  pot: CookingPot,
  list: ListChecks,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorToken;
  /** Thicker stroke for active states. */
  strokeWidth?: number;
  /** Solid fill, e.g. a favourited heart. */
  fill?: ColorToken;
};

export function Icon({ name, size = 24, color = 'text', strokeWidth = 1.9, fill }: IconProps) {
  const Component = ICONS[name];
  return (
    <Component
      size={size}
      color={colors[color]}
      strokeWidth={strokeWidth}
      fill={fill ? colors[fill] : 'none'}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    />
  );
}
