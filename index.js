// index.js
import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/scrape/providers", async (req, res) => {
  const { title } = req.query;
  if (!title) return res.status(400).json({ error: "Missing title param" });

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  
  const page = await browser.newPage();

  await page.goto(`https://www.justwatch.com/fr/recherche?q=${encodeURIComponent(title)}`);
  await page.waitForSelector(".title-list-row__row");
  const firstLink = await page.$(".title-list-row__row a");
  if (!firstLink) {
    await browser.close();
    return res.json([]);
  }

  await firstLink.click();
  await page.waitForNavigation();

  const providers = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".price-comparison__grid__row")).map(el => ({
      name: el.querySelector(".price-comparison__grid__row__icon img")?.alt,
      logo_url: el.querySelector(".price-comparison__grid__row__icon img")?.src,
      type: "vod",
      link: window.location.href,
    }));
  });

  await browser.close();
  res.json(providers);
});

app.listen(PORT, () => {
  console.log(`✅ Scraper backend listening on ${PORT}`);
});
