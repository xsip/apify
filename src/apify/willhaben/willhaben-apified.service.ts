import { WillhabenApifyModel } from './willhaben-apified.interfaces';
import { ApifyService } from '../apify.service';
import * as jsdom from 'jsdom';
export const willhabenApify = new ApifyService<WillhabenApifyModel>(
  '[id^="search-result-entry-header-"]',
  {
    productName: 'h3',
    productPrice: 'span',
    // publishDate: 'p',
    publishDate: (element: string) => {
      const dom = new jsdom.JSDOM(element);
      return dom.window.document.body.querySelector('p')?.innerHTML;
    },
  },
  {
    productPrice: (value: string): number => {
      return parseInt(value.replace('€', '').replace(/\./, ''));
    },
  }
);
