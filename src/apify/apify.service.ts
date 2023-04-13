import { Page } from 'puppeteer';
import { BrowserService } from '../browser.service';
import * as JDSDOM from 'jsdom';
import * as JSDOM from 'jsdom';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type Transformers<T> = Partial<Record<keyof Partial<T>, (value: string) => any>>;
export type ApifyResponse<T> = Record<keyof T, string>;
type StrOrFn = string | ((el: HTMLElement) => Promise<string>);

export class ApifyService<T> {
  constructor(
    private elementContainerSelector: string,
    private childSelectors: Record<keyof T, any>,
    private transformers: Transformers<T> = {} as Transformers<T>,
    private browserService = new BrowserService()
  ) {}

  async getElements(
    url: string,
    waitTill: 'networkidle0' | ((page: Page) => Promise<void>) = 'networkidle0',
    closePage = true
  ): Promise<ApifyResponse<T>[]> {
    const page: Page = await this.browserService.browser.newPage();
    if (waitTill === 'networkidle0') {
      await this.browserService.awaitNavigation(page, url);
    } else {
      await page.goto(url);
      await waitTill(page);
    }
    await this.browserService.scrollToBottom(page);
    const functions: Record<keyof T, boolean> = {} as Record<keyof T, boolean>;
    for (const fnName in this.childSelectors) {
      if (typeof this.childSelectors[fnName as keyof T] === 'function') {
        console.log('FNName: ', fnName);
        await page.exposeFunction(fnName as any, this.childSelectors[fnName as keyof T] as any);
        functions[fnName as keyof T] = true;
      }
    }
    console.log(functions);
    const res = await page.evaluate(
      (selectors: Record<keyof T, any>, elementContainerSelector: string, fns: Record<keyof T, boolean>) => {
        console.log(selectors);
        return [...document.querySelectorAll(elementContainerSelector)].map((element) => {
          const response: Record<keyof T, unknown> = {} as Record<keyof T, unknown>;

          [...Object.keys(fns), ...Object.keys(selectors)].forEach((key) => {
            console.log('Is function ' + key, typeof selectors[key as keyof T]);
            if (fns[key as keyof T]) {
              console.log('Is function ' + key);
              // eslint-disable-next-line destructuring/no-rename
              // const { dom: doc2 } = new JSDOM.JSDOM(document.body.outerHTML);
              //@ts-ignore
              window.el = element;
              response[key as keyof T] = eval(`${key}(window.el.outerHTML);`); // eval(`${key}(${element});`);
              return;
            } else if (typeof selectors[key as keyof T] === 'string') {
              response[key as keyof T] =
                (element.querySelector(selectors[key as keyof T]) as unknown as HTMLElement)?.innerText ?? ('' as any);
            }
          });
          return response;
        });
      },
      this.childSelectors,
      this.elementContainerSelector,
      functions
    );

    for (const entry of res) {
      for (const key of Object.keys(this.transformers)) {
        entry[key as keyof typeof entry] = await this.transformers[key as keyof Transformers<T>]?.(
          entry[key as keyof typeof entry] as string
        );
      }
    }
    if (closePage) await page.close();
    return res as ApifyResponse<T>[];
  }
}
