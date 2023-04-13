import { WillhabenApifyModel } from './willhaben-apified.interfaces';
import { ApifyService } from '../apify.service';
import * as jsdom from 'jsdom';
import { toHtmlElement } from '../utils';
export const willhabenApify = new ApifyService<WillhabenApifyModel>(
  '[id^="search-result-entry-header-"]',
  {
    productName: 'h3',
    productPrice: 'span',
    // publishDate: 'p',
    publishDate: (element: string) => {
      return toHtmlElement<HTMLDivElement>(element).querySelector('p')?.innerHTML;
    },
  },
  {
    productPrice: (value: string): number => {
      return parseInt(value.replace('€', '').replace(/\./, ''));
    },
  }
);
