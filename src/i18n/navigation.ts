import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Navigation utilities for internationalized routing
 *
 * These are drop-in replacements for Next.js navigation that
 * automatically handle locale prefixes.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
