import { WillhabenApifyModel } from './willhaben-apified.interfaces';
import { ApifyService } from '../apify.service';

export const willhabenApify = new ApifyService<WillhabenApifyModel>(
  '[id^="search-result-entry-header-"]',
  {
    productName: 'h3',
    productPrice: 'span',
    // publishDate: 'p',
    publishDate: (element: string) => {
      console.log(element);
      return ''; // element.querySelector('p')?.innerHTML;
    },
  },
  {
    productPrice: (value: string): number => {
      return parseInt(value.replace('€', '').replace(/\./, ''));
    },
  }
);
