import { harvestInteractiveNodes, type DomNode } from './locatorBind.js';

export interface BrowserSession {
  url(target: string): Promise<unknown>;
  pause?(ms: number): Promise<unknown>;
  waitUntil?(condition: () => Promise<boolean>, options?: { timeout?: number }): Promise<unknown>;
  execute<T>(script: string | ((...args: never[]) => T)): Promise<T>;
  $?(selector: string): Promise<{
    isExisting(): Promise<boolean>;
    setValue(value: string): Promise<unknown>;
    click(): Promise<unknown>;
  }>;
  deleteSession?(): Promise<unknown>;
}

export interface HarvestBrowserOptions {
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
  openBrowser?: (env: NodeJS.ProcessEnv) => Promise<BrowserSession>;
}

function collectVisibleNodes(): DomNode[] {
  const nodes: DomNode[] = [];
  const seen = new Set<string>();
  const root = globalThis as unknown as {
    document: {
      querySelectorAll(selector: string): Iterable<{
        tagName?: string;
        id?: string;
        textContent?: string | null;
        getAttribute(name: string): string | null;
      }>;
    };
  };
  const list = root.document.querySelectorAll('a,button,input,select,textarea,label,h1,h2,h3,h4,img,article,svg,[role],[data-testid],[aria-label],[alt],[title]');
  for (const el of list) {
    const text = String(el.getAttribute('alt') || el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '')
      .replace(/\s+/g, ' ')
      .trim();
    const node = {
      tag: String(el.tagName || '').toLowerCase(),
      testid: el.getAttribute('data-testid') || undefined,
      name: el.getAttribute('name') || undefined,
      id: el.id || undefined,
      aria: el.getAttribute('aria-label') || undefined,
      text: text || undefined,
    };
    const key = [node.tag, node.testid, node.name, node.id, node.aria, node.text].join('|');
    if (seen.has(key) || !(node.testid || node.name || node.id || node.aria || node.text)) continue;
    seen.add(key);
    nodes.push(node);
  }
  return nodes;
}

export async function harvestRenderedNodes(browser: BrowserSession): Promise<DomNode[]> {
  const nodes = await browser.execute(collectVisibleNodes);
  return Array.isArray(nodes) ? nodes.filter((node) => node && (node.testid || node.name || node.id || node.aria || node.text)) : [];
}

export async function harvestProductWithBrowser(
  urls: string[],
  options: HarvestBrowserOptions = {},
): Promise<DomNode[]> {
  const env = options.env ?? process.env;
  const timeoutMs = options.timeoutMs ?? Number(env.PRODUCT_BIND_TIMEOUT_MS || 20000);
  const browser = options.openBrowser ? await options.openBrowser(env) : await startChrome(env);
  const nodes: DomNode[] = [];
  try {
    await loginInBrowser(browser, env);
    for (const url of urls) {
      await browser.url(url);
      await waitForPage(browser, timeoutMs);
      nodes.push(...await harvestRenderedNodes(browser));
    }
  } finally {
    if (browser.deleteSession) {
      await browser.deleteSession().catch(() => undefined);
    }
  }
  return nodes;
}

export async function startChrome(env: NodeJS.ProcessEnv = process.env): Promise<BrowserSession> {
  const { remote } = await import('webdriverio');
  const chromeOptions: Record<string, unknown> = {
    args: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--window-size=1280,1024'],
  };
  if (env.CHROME_BINARY) {
    chromeOptions.binary = env.CHROME_BINARY;
  }
  return await remote({
    logLevel: 'error',
    capabilities: {
      browserName: 'chrome',
      'goog:chromeOptions': chromeOptions,
    },
  }) as unknown as BrowserSession;
}

async function loginInBrowser(browser: BrowserSession, env: NodeJS.ProcessEnv): Promise<void> {
  const loginUrl = String(env.PRODUCT_LOGIN_URL || '').trim();
  const user = String(env.PRODUCT_USER || '').trim();
  const password = String(env.PRODUCT_PASSWORD || '').trim();
  if (!loginUrl || !user || !password || !browser.$) return;
  await browser.url(loginUrl);
  await waitForPage(browser, Number(env.PRODUCT_BIND_TIMEOUT_MS || 20000));
  const userField = await firstExisting(browser, ['input[type="email"]', 'input[name="email"]', 'input[name="username"]', 'input[type="text"]']);
  const passField = await firstExisting(browser, ['input[type="password"]']);
  if (userField) await userField.setValue(user);
  if (passField) await passField.setValue(password);
  const submit = await firstExisting(browser, ['button[type="submit"]', 'input[type="submit"]', 'button']);
  if (submit) await submit.click();
  await waitForPage(browser, Number(env.PRODUCT_BIND_TIMEOUT_MS || 20000));
}

async function firstExisting(browser: BrowserSession, selectors: string[]) {
  if (!browser.$) return null;
  for (const selector of selectors) {
    const element = await browser.$(selector);
    if (await element.isExisting()) return element;
  }
  return null;
}

async function waitForPage(browser: BrowserSession, timeoutMs: number): Promise<void> {
  if (browser.waitUntil) {
    await browser.waitUntil(async () => {
      const state = await browser.execute(() => (globalThis as { document?: { readyState?: string } }).document?.readyState);
      return state === 'complete';
    }, { timeout: timeoutMs });
  }
  if (browser.pause) {
    await browser.pause(400);
  }
}

export function nodesFromHtml(html: string): DomNode[] {
  return harvestInteractiveNodes(html);
}
