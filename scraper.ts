const puppeteer = require("puppeteer");

async function scrap() {
    const browser = await puppeteer.launch({ headless: "new"});
    const page = await browser.newPage();
    await page.goto("https://www.amazon.com.br/bestsellers");

    await page.waitForSelector('.zg-carousel-general-faceout');

   const result = await page.evaluate(() => {
        const products = Array.from(document.querySelectorAll('.zg-carousel-general-faceout')).slice(0, 3);
        
        return products.map(product => ({
            id : product.querySelector('.p13n-sc-uncoverable-faceout')?.id,
            title: product.querySelector('.p13n-sc-truncate-desktop-type2')?.textContent?.trim(),
            price: product.querySelector('._cDEzb_p13n-sc-price_3mJ9Z')?.textContent?.trim(),
            image: product.querySelector('img.p13n-product-image')?.getAttribute('src'),
        }));
    });

    console.log("Os 3 melhores produtos são:", result);

    browser.close();
}

scrap().catch(err => console.error("Erro no scraper:", err));