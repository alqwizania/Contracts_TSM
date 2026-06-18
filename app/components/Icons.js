import React from 'react';
import {
  LayoutDashboard,
  Calculator,
  Users,
  LogOut,
  Search,
  Menu,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Trash2,
  Lock,
  Plus,
  MessageSquare,
  AlertCircle,
  ShieldAlert,
  Link2,
  Home,
  Folder,
  FileText,
  Trophy,
  TrendingUp,
  Building2,
  Pencil,
  Zap,
  DollarSign,
  Clipboard,
  LineChart
} from 'lucide-react';

export const DashboardIcon = ({ size = 20, ...props }) => <LayoutDashboard size={size} {...props} />;
export const CalculatorIcon = ({ size = 20, ...props }) => <Calculator size={size} {...props} />;
export const UsersIcon = ({ size = 20, ...props }) => <Users size={size} {...props} />;
export const LogOutIcon = ({ size = 18, ...props }) => <LogOut size={size} {...props} />;
export const SearchIcon = ({ size = 20, ...props }) => <Search size={size} {...props} />;
export const MenuIcon = ({ size = 20, ...props }) => <Menu size={size} {...props} />;
export const ChevronRightIcon = ({ size = 20, ...props }) => <ChevronRight size={size} {...props} />;
export const ChevronLeftIcon = ({ size = 20, ...props }) => <ChevronLeft size={size} {...props} />;
export const ChevronDownIcon = ({ size = 16, ...props }) => <ChevronDown size={size} {...props} />;
export const TrashIcon = ({ size = 16, ...props }) => <Trash2 size={size} {...props} />;
export const LockIcon = ({ size = 16, ...props }) => <Lock size={size} {...props} />;
export const PlusIcon = ({ size = 18, ...props }) => <Plus size={size} {...props} />;
export const MessageIcon = ({ size = 18, ...props }) => <MessageSquare size={size} {...props} />;
export const AlertIcon = ({ size = 18, ...props }) => <AlertCircle size={size} {...props} />;
export const ShieldAlertIcon = ({ size = 24, ...props }) => <ShieldAlert size={size} {...props} />;
export const LinkIcon = ({ size = 14, ...props }) => <Link2 size={size} {...props} />;
export const HomeIcon = ({ size = 20, ...props }) => <Home size={size} {...props} />;
export const FolderIcon = ({ size = 20, ...props }) => <Folder size={size} {...props} />;
export const FileTextIcon = ({ size = 20, ...props }) => <FileText size={size} {...props} />;
export const TrophyIcon = ({ size = 20, ...props }) => <Trophy size={size} {...props} />;
export const TrendUpIcon = ({ size = 20, ...props }) => <TrendingUp size={size} {...props} />;
export const BuildingIcon = ({ size = 20, ...props }) => <Building2 size={size} {...props} />;
export const PencilIcon = ({ size = 20, ...props }) => <Pencil size={size} {...props} />;
export const FlashIcon = ({ size = 20, ...props }) => <Zap size={size} {...props} />;
export const DollarIcon = ({ size = 20, ...props }) => <DollarSign size={size} {...props} />;
export const ClipboardIcon = ({ size = 20, ...props }) => <Clipboard size={size} {...props} />;
export const ChartIcon = ({ size = 20, ...props }) => <LineChart size={size} {...props} />;

export const ProjectLogo = ({ size = 36, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
    <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
    <path d="M16 6 L26 11 L26 21 L16 26 L6 21 L6 11 Z" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 6 L16 26 M6 11 L26 21 M6 21 L26 11" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    <path d="M11 18 L15 22 L22 12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="16" cy="6" r="2.5" fill="#f59e0b" />
    <circle cx="26" cy="11" r="2" fill="#0da678" />
    <circle cx="26" cy="21" r="2" fill="#0da678" />
    <circle cx="6" cy="21" r="2" fill="#0b7285" />
    <circle cx="6" cy="11" r="2" fill="#0b7285" />
    <defs>
      <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0b7285" />
        <stop offset="1" stopColor="#0da678" />
      </linearGradient>
    </defs>
  </svg>
);
