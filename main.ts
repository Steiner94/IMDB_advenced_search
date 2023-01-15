import { Dataset, PlaywrightCrawler } from 'crawlee';

const crawler = new PlaywrightCrawler({
  requestHandler: async ({ page, enqueueLinks, request }) => {
    console.log(`Processing: ${request.url}`);

    await enqueueLinks({
      selector: '.lister-page-next',
    });
    await page.waitForSelector('.mode-advanced');

    const actorTexts = await page.$$eval('.mode-advanced', (els) => {
      var i = 1;
      return els
        .map((el) => {
          let movieName = el.querySelector(
            `#main > div > div.lister.list.detail.sub-list > div > div:nth-child(${i}) > div.lister-item-content > h3 > a`
          )?.textContent;
          let movieRank = el.querySelector('.ratings-imdb-rating')?.textContent;
          let movieLength = document.querySelector('.runtime')?.textContent;
          let movieStars = el.querySelector(
            `#main > div > div.lister.list.detail.sub-list > div > div:nth-child(${i++}) > div.lister-item-content > p:nth-child(5)`
          )?.textContent;
          if (movieRank !== null && movieRank !== undefined)
            return {
              movieName: movieName,
              movieRank: movieRank.replace(/\s+/g, ''),
              movieLength: movieLength,
              movieStars: movieStars
                ?.replace(
                  movieStars?.substr(0, movieStars?.indexOf('Stars')),
                  ''
                )
                .replace(/\n/g, ''),
            };
          else return null;
        })
        .filter((item) => item !== null);
    });

    Dataset.pushData({ actorTexts });
  },
});

await crawler.run([
  'https://www.imdb.com/search/title/?title_type=feature,tv_movie&start=0',
]);
