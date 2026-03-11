import puppeteer from 'puppeteer';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const dDBDocClient = DynamoDBDocumentClient.from(client);

async function scrap() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.amazon.com.br/bestsellers");

    await page.waitForSelector('.zg-carousel-general-faceout');

    const products = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('.zg-carousel-general-faceout')).slice(0, 3);

        return items.map(product => ({
            id: product.querySelector('.p13n-sc-uncoverable-faceout')?.id || `temp-${Math.random()}`,
            title: product.querySelector('.p13n-sc-truncate-desktop-type2')?.textContent?.trim() || "Nome do produto indisponível",
            price: product.querySelector('._cDEzb_p13n-sc-price_3mJ9Z')?.textContent?.trim() || "Preço indisponível",
            image: product.querySelector('img.p13n-product-image')?.getAttribute('src') || "Imagem indisponível",
            link : (product.querySelector('a.a-link-normal') as HTMLAnchorElement)?.href || "Link não encontrado"
        }));
    });

    console.log(`DEBUG: Encontrados ${products.length} produtos. Salvando no banco...`);

    for (const product of products) {
        const params = {
            TableName: "ProductsTable-dev",
            Item: product
        }

        try {
            await dDBDocClient.send(new PutCommand(params));
        } catch (error) {
            console.log(`Erro ao salvar o produto ${product.id}:`, error);
        }
    };


    browser.close();
}

scrap();