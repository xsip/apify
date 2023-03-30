## Apify.
### ✨ Apify Websites using puppeteer ✨


**Apify** gives you the possibility to **create Apis** out of selectors.


### Usage example

By defining the Container as the first parameter and selector per property as the second paremeter and additionally transform functions per property in the third paremer all matching objects will be scraped.


    import { ApifyService } from '../apify.service';
    import { BackmarketApifyModel } from './backmarket-apified.interfaces';
    
    export const backMarketApify =new ApifyService<BackmarketApifyModel>(
        'div:has(> a[data-test="product-thumb"])',
        {
            productName: 'h2',
            productPrice: '[data-qa="prices"]',
        },
        {
            productPrice: (value: string): number => {
            // € 89,99\n€ 399,00
            return parseInt(value.split('\n')[0].replace('€', '').replace(/\./, ''));
            },
        }
    );



After defining your class you can execute the scraper using:

    (async () => {
        await new BrowserService().setup();
        // navigation options
        // backMarketApify.waitTillIdleNavigation = false;
        // backMarketApify.sleepAfterNavigation = 5000; //  only if no idle navigation
        const res = await backMarketApify.getElements(
            'https://www.backmarket.at/de-at/l/top-angebote/be9b14f4-89e2-4315-8d3b-4d7d613b562f#sort=prod_index_price_asc_de-at',
            (page: Page) => sleepAsync(5000)
        );
        fs.writeFileSync('backmarket.json', JSON.stringify(res, null, 2), 'utf-8');
    })();
