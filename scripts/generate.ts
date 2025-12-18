#!/usr/bin/env node

/**
 * PUZZLE KIT GENERATOR
 *
 * CLI tool for generating pages, modals, and events.
 *
 * Usage:
 *   npm run generate              # Interactive mode
 *   npm run generate page shop    # Generate a page named "shop"
 *   npm run generate modal reward # Generate a modal named "reward"
 *   npm run generate event rush   # Generate an event named "rush"
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const ROOT_DIR = process.cwd();
const SRC_DIR = path.join(ROOT_DIR, 'src');
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');

const PATHS = {
  registry: path.join(SRC_DIR, 'config', 'registry.ts'),
  appShell: path.join(SRC_DIR, 'components', 'layout', 'AppShell.tsx'),
  modalManager: path.join(SRC_DIR, 'components', 'modals', 'ModalManager.tsx'),
  menusIndex: path.join(SRC_DIR, 'components', 'menus', 'index.ts'),
  modalsIndex: path.join(SRC_DIR, 'components', 'modals', 'index.ts'),
  liveopsDir: path.join(SRC_DIR, 'components', 'liveops'),
  menusDir: path.join(SRC_DIR, 'components', 'menus'),
  modalsDir: path.join(SRC_DIR, 'components', 'modals'),
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info'): void {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warn: '\x1b[33m',    // Yellow
  };
  const reset = '\x1b[0m';
  const prefix = type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warn' ? '!' : '→';
  console.log(`${colors[type]}${prefix}${reset} ${message}`);
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf-8');
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

function generatePageContent(name: string, category: 'main' | 'liveops' = 'main'): string {
  const pascalName = toPascalCase(name);
  const kebabName = toKebabCase(name);
  const title = pascalName.replace(/([A-Z])/g, ' $1').trim();

  if (category === 'liveops') {
    return `'use client';

import React, { useState } from 'react';
import { useNavigation, useAdmin } from '@/store';
import { useEvent, useTimer, useModal } from '@/hooks';
import { BottomNavigation } from '@/components/shared';
import { ProgressBar } from '@/components/base';

const EVENT_ID = '${kebabName}';
const PAGE_ID = '${kebabName}';
const EVENT_TITLE = '${title}';

export function ${pascalName}Page() {
  const { navigate, goBack } = useNavigation();
  const { isEventEnabled } = useAdmin();
  const { open } = useModal();
  const event = useEvent(EVENT_ID, { optional: true });
  const [showInfo, setShowInfo] = useState(false);

  if (!isEventEnabled(EVENT_ID)) {
    return (
      <div className="flex flex-col h-full bg-bg-page items-center justify-center p-8">
        <h2 className="text-h3 text-text-primary mb-2">Event Not Available</h2>
        <button onClick={() => navigate('main-menu')} className="px-4 py-2 bg-bg-inverse text-text-inverse rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-bg-page">
      {/* Header */}
      <header className="relative bg-bg-inverse text-text-inverse">
        <button onClick={goBack} className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <span>&times;</span>
        </button>
        <button onClick={() => setShowInfo(true)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <span>?</span>
        </button>
        <div className="pt-12 pb-4 px-4 text-center">
          <h1 className="text-h2 font-bold mb-1">${title}</h1>
          <p className="text-body-sm opacity-80 mb-3">Complete challenges to earn rewards!</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10">
            <span className="text-caption">Ends in:</span>
            <span className="text-value font-mono">{event.timeRemainingFormatted}</span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-4 bg-bg-card border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <span className="text-body-sm text-text-muted">Progress</span>
          <span className="text-value font-bold text-text-primary">{event.progress} / {event.maxProgress}</span>
        </div>
        <ProgressBar value={event.percentComplete} size="md" />
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="bg-bg-card rounded-xl border-2 border-border p-4">
          <h2 className="text-h4 text-text-primary mb-2">Event Content</h2>
          <p className="text-body text-text-secondary">Add your event content here.</p>
        </div>
      </main>

      <BottomNavigation activePage={PAGE_ID} />
    </div>
  );
}

export default ${pascalName}Page;
`;
  }

  return `'use client';

import React from 'react';
import { useNavigation } from '@/store';
import { usePlayer } from '@/hooks';
import { BottomNavigation } from '@/components/shared';

const PAGE_ID = '${kebabName}';
const PAGE_TITLE = '${title}';

export function ${pascalName}Page() {
  const { goBack, canGoBack } = useNavigation();
  const { coins, stars } = usePlayer();

  return (
    <div className="flex flex-col h-full bg-bg-page">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-card">
        {canGoBack && (
          <button onClick={goBack} className="w-8 h-8 rounded-full bg-bg-muted flex items-center justify-center">
            <span className="text-text-primary">&larr;</span>
          </button>
        )}
        <h1 className="text-h3 text-text-primary font-bold flex-1 text-center">{PAGE_TITLE}</h1>
        <div className="w-8" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="bg-bg-card rounded-xl border-2 border-border p-4">
          <h2 className="text-h4 text-text-primary mb-2">Page Content</h2>
          <p className="text-body text-text-secondary">Add your content here.</p>
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <img src="/icons/Coin.svg" alt="coins" className="w-5 h-5" />
              <span className="text-text-secondary">{coins}</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/icons/Star.svg" alt="stars" className="w-5 h-5" />
              <span className="text-text-secondary">{stars}</span>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation activePage={PAGE_ID} />
    </div>
  );
}

export default ${pascalName}Page;
`;
}

function generateModalContent(name: string): string {
  const pascalName = toPascalCase(name);
  const title = pascalName.replace(/([A-Z])/g, ' $1').trim();

  return `'use client';

import React from 'react';
import { useModal, useModalParams } from '@/hooks';

interface ${pascalName}ModalParams {
  // Add your modal parameters here
}

interface Props {
  onAnimatedClose?: () => void;
}

export function ${pascalName}Modal({ onAnimatedClose }: Props) {
  const { close } = useModal();
  const params = useModalParams<${pascalName}ModalParams>();

  const handleClose = () => {
    if (onAnimatedClose) {
      onAnimatedClose();
    } else {
      close();
    }
  };

  return (
    <div className="w-[300px] bg-bg-card rounded-xl border-2 border-border overflow-hidden">
      {/* Header */}
      <div className="bg-bg-inverse py-2.5 px-3 flex items-center justify-center relative">
        <h2 className="text-text-inverse text-h4">${title}</h2>
        <button
          onClick={handleClose}
          className="absolute right-2 w-7 h-7 bg-bg-muted rounded-full flex items-center justify-center border border-border hover:opacity-80"
        >
          <span className="text-text-primary text-value">&times;</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-body text-text-secondary text-center mb-4">
          Add your modal content here.
        </p>

        <button
          onClick={handleClose}
          className="w-full py-2.5 bg-bg-inverse text-text-inverse rounded-lg font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ${pascalName}Modal;
`;
}

// ═══════════════════════════════════════════════════════════════════════════
// REGISTRY UPDATERS
// ═══════════════════════════════════════════════════════════════════════════

function addToPageRegistry(name: string, category: 'main' | 'liveops' = 'main'): boolean {
  const kebabName = toKebabCase(name);
  const displayName = toPascalCase(name).replace(/([A-Z])/g, ' $1').trim();

  let content = readFile(PATHS.registry);

  // Check if already exists
  if (content.includes(`'${kebabName}':`)) {
    log(`Page '${kebabName}' already exists in registry`, 'warn');
    return false;
  }

  // Find the end of PAGE_REGISTRY
  const pageRegistryEnd = content.indexOf('} as const;');
  if (pageRegistryEnd === -1) {
    log('Could not find PAGE_REGISTRY end marker', 'error');
    return false;
  }

  // Add new entry before the closing
  const newEntry = `  '${kebabName}': {
    id: '${kebabName}',
    name: '${displayName}',
    icon: '/icons/Star.svg',
    category: '${category}',
  },\n`;

  content = content.slice(0, pageRegistryEnd) + newEntry + content.slice(pageRegistryEnd);
  writeFile(PATHS.registry, content);

  return true;
}

function addToModalRegistry(name: string): boolean {
  const kebabName = toKebabCase(name);
  const displayName = toPascalCase(name).replace(/([A-Z])/g, ' $1').trim();

  let content = readFile(PATHS.registry);

  // Check if already exists
  if (content.includes(`'${kebabName}':`)) {
    log(`Modal '${kebabName}' already exists in registry`, 'warn');
    return false;
  }

  // Find MODAL_REGISTRY end
  const modalRegistryMatch = content.match(/MODAL_REGISTRY = \{[\s\S]*?\} as const;/);
  if (!modalRegistryMatch) {
    log('Could not find MODAL_REGISTRY', 'error');
    return false;
  }

  const registryContent = modalRegistryMatch[0];
  const lastEntry = registryContent.lastIndexOf('},');
  const insertPoint = content.indexOf(registryContent) + lastEntry + 2;

  const newEntry = `\n  '${kebabName}': { id: '${kebabName}', name: '${displayName}' },`;

  content = content.slice(0, insertPoint) + newEntry + content.slice(insertPoint);
  writeFile(PATHS.registry, content);

  return true;
}

function addToEventRegistry(name: string): boolean {
  const kebabName = toKebabCase(name);
  const displayName = toPascalCase(name).replace(/([A-Z])/g, ' $1').trim();
  const shortLabel = name.split('-').map(w => w[0].toUpperCase()).join('');

  let content = readFile(PATHS.registry);

  // Check if already exists
  if (content.includes(`'${kebabName}':`)) {
    log(`Event '${kebabName}' already exists in registry`, 'warn');
    return false;
  }

  // Find EVENT_REGISTRY end
  const eventRegistryMatch = content.match(/EVENT_REGISTRY = \{[\s\S]*?\} as const;/);
  if (!eventRegistryMatch) {
    log('Could not find EVENT_REGISTRY', 'error');
    return false;
  }

  const registryContent = eventRegistryMatch[0];
  const lastEntry = registryContent.lastIndexOf('},');
  const insertPoint = content.indexOf(registryContent) + lastEntry + 2;

  const newEntry = `
  '${kebabName}': {
    id: '${kebabName}',
    name: '${displayName}',
    icon: '/icons/Star.svg',
    shortLabel: '${shortLabel}',
    page: '${kebabName}' as const,
    description: '${displayName} event',
  },`;

  content = content.slice(0, insertPoint) + newEntry + content.slice(insertPoint);
  writeFile(PATHS.registry, content);

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════

function addPageToAppShell(name: string, category: 'main' | 'liveops' = 'main'): boolean {
  const pascalName = toPascalCase(name);
  const kebabName = toKebabCase(name);
  const componentName = `${pascalName}Page`;
  const componentPath = category === 'liveops' ? '@/components/liveops' : '@/components/menus';

  let content = readFile(PATHS.appShell);

  // Check if already imported
  if (content.includes(componentName)) {
    log(`${componentName} already in AppShell`, 'warn');
    return false;
  }

  // Add dynamic import after existing dynamic imports
  const dynamicImportPattern = /const \w+Page = dynamic\(/g;
  let lastMatch;
  let match;
  while ((match = dynamicImportPattern.exec(content)) !== null) {
    lastMatch = match;
  }

  if (lastMatch) {
    const lineEnd = content.indexOf('\n', lastMatch.index + lastMatch[0].length);
    const nextLineEnd = content.indexOf('\n', lineEnd + 1);
    const insertPoint = nextLineEnd + 1;

    const newImport = `const ${componentName} = dynamic(() => import('${componentPath}/${componentName}').then(m => ({ default: m.${componentName} })), { loading: () => <PageSkeleton /> });\n`;

    content = content.slice(0, insertPoint) + newImport + content.slice(insertPoint);
  }

  // Add to pageComponents map
  const mapPattern = /const pageComponents: Record<PageId, React\.ComponentType> = \{/;
  const mapMatch = content.match(mapPattern);
  if (mapMatch) {
    const mapEnd = content.indexOf('};', mapMatch.index!);
    const insertPoint = mapEnd;
    const newEntry = `  '${kebabName}': ${componentName},\n`;
    content = content.slice(0, insertPoint) + newEntry + content.slice(insertPoint);
  }

  writeFile(PATHS.appShell, content);
  return true;
}

function addModalToManager(name: string): boolean {
  const pascalName = toPascalCase(name);
  const kebabName = toKebabCase(name);
  const componentName = `${pascalName}Modal`;

  let content = readFile(PATHS.modalManager);

  // Check if already imported
  if (content.includes(componentName)) {
    log(`${componentName} already in ModalManager`, 'warn');
    return false;
  }

  // Add dynamic import
  const dynamicImportPattern = /const \w+Modal = dynamic\(/g;
  let lastMatch;
  let match;
  while ((match = dynamicImportPattern.exec(content)) !== null) {
    lastMatch = match;
  }

  if (lastMatch) {
    const lineEnd = content.indexOf('\n', lastMatch.index + lastMatch[0].length);
    const nextLineEnd = content.indexOf('\n', lineEnd + 1);
    const insertPoint = nextLineEnd + 1;

    const newImport = `const ${componentName} = dynamic(() => import('./${componentName}').then(m => ({ default: m.${componentName} })), { loading: () => <ModalSkeleton /> });\n`;

    content = content.slice(0, insertPoint) + newImport + content.slice(insertPoint);
  }

  // Add to modalComponents map
  const mapPattern = /const modalComponents:/;
  const mapMatch = content.match(mapPattern);
  if (mapMatch) {
    const mapEnd = content.indexOf('};', mapMatch.index!);
    const insertPoint = mapEnd;
    const newEntry = `  '${kebabName}': ${componentName},\n`;
    content = content.slice(0, insertPoint) + newEntry + content.slice(insertPoint);
  }

  writeFile(PATHS.modalManager, content);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

function generatePage(name: string, category: 'main' | 'liveops' = 'main'): void {
  const pascalName = toPascalCase(name);
  const componentName = `${pascalName}Page`;
  const targetDir = category === 'liveops' ? PATHS.liveopsDir : PATHS.menusDir;
  const filePath = path.join(targetDir, `${componentName}.tsx`);

  log(`Generating page: ${componentName}`, 'info');

  // Check if file exists
  if (fileExists(filePath)) {
    log(`File already exists: ${filePath}`, 'error');
    return;
  }

  // Generate file
  const content = generatePageContent(name, category);
  writeFile(filePath, content);
  log(`Created: ${filePath}`, 'success');

  // Update registry
  if (addToPageRegistry(name, category)) {
    log('Added to PAGE_REGISTRY', 'success');
  }

  // Update AppShell
  if (addPageToAppShell(name, category)) {
    log('Added to AppShell', 'success');
  }

  log(`\nPage '${componentName}' generated successfully!`, 'success');
  log(`Navigate to it with: navigate('${toKebabCase(name)}')`, 'info');
}

function generateModal(name: string): void {
  const pascalName = toPascalCase(name);
  const componentName = `${pascalName}Modal`;
  const filePath = path.join(PATHS.modalsDir, `${componentName}.tsx`);

  log(`Generating modal: ${componentName}`, 'info');

  // Check if file exists
  if (fileExists(filePath)) {
    log(`File already exists: ${filePath}`, 'error');
    return;
  }

  // Generate file
  const content = generateModalContent(name);
  writeFile(filePath, content);
  log(`Created: ${filePath}`, 'success');

  // Update registry
  if (addToModalRegistry(name)) {
    log('Added to MODAL_REGISTRY', 'success');
  }

  // Update ModalManager
  if (addModalToManager(name)) {
    log('Added to ModalManager', 'success');
  }

  log(`\nModal '${componentName}' generated successfully!`, 'success');
  log(`Open it with: openModal('${toKebabCase(name)}')`, 'info');
}

function generateEvent(name: string): void {
  const kebabName = toKebabCase(name);

  log(`Generating event: ${kebabName}`, 'info');

  // Add to event registry
  if (addToEventRegistry(name)) {
    log('Added to EVENT_REGISTRY', 'success');
  }

  // Generate page
  generatePage(name, 'liveops');

  log(`\nEvent '${kebabName}' generated successfully!`, 'success');
  log(`Don't forget to add event data in src/config/initialData.ts`, 'warn');
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTIVE MODE
// ═══════════════════════════════════════════════════════════════════════════

async function interactiveMode(): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  console.log('\n🧩 PUZZLE KIT GENERATOR\n');

  const type = await question('What do you want to generate? (page/modal/event): ');
  const name = await question('Enter a name (e.g., "my-feature" or "MyFeature"): ');

  if (!name.trim()) {
    log('Name is required', 'error');
    rl.close();
    return;
  }

  switch (type.toLowerCase().trim()) {
    case 'page':
    case 'p': {
      const category = await question('Category? (main/liveops) [main]: ');
      generatePage(name.trim(), category.trim() === 'liveops' ? 'liveops' : 'main');
      break;
    }
    case 'modal':
    case 'm':
      generateModal(name.trim());
      break;
    case 'event':
    case 'e':
      generateEvent(name.trim());
      break;
    default:
      log(`Unknown type: ${type}. Use page, modal, or event.`, 'error');
  }

  rl.close();
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    await interactiveMode();
    return;
  }

  const [type, name] = args;

  if (!name) {
    log('Usage: npm run generate <type> <name>', 'error');
    log('Types: page, modal, event', 'info');
    log('Example: npm run generate page my-page', 'info');
    process.exit(1);
  }

  switch (type.toLowerCase()) {
    case 'page':
    case 'p':
      generatePage(name);
      break;
    case 'modal':
    case 'm':
      generateModal(name);
      break;
    case 'event':
    case 'e':
      generateEvent(name);
      break;
    default:
      log(`Unknown type: ${type}. Use page, modal, or event.`, 'error');
      process.exit(1);
  }
}

main().catch(console.error);
