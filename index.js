import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/api/scrape/providers", async (req, res) => {
  const { title } = req.query;
  if (!title) return res.status(400).json({ error: "Missing title param" });

  try {
    // Lancer toutes les sources en parallèle
    const [vod, cinema, tv] = await Promise.all([
      scrapeJustWatch(title),
      scrapeAlloCine(title),
      scrapeProgrammeTV(title),
    ]);

    res.json({
      vod,
      cinema,
      tv,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scraping failed", details: err.toString() });
  }
});

// -------- JustWatch --------
async function scrapeJustWatch(title) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "stylesheet", "font"].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(
    `https://www.justwatch.com/fr/recherche?q=${encodeURIComponent(title)}`,
    {
      waitUntil: "domcontentloaded",
      timeout: 0,
    }
  );
  await page.waitForSelector(".title-list-row__row", { timeout: 0 });
  const firstLink = await page.$(".title-list-row__row a");
  if (!firstLink) {
    await browser.close();
    return [];
  }
  await firstLink.click();
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 0 });

  const providers = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(".price-comparison__grid__row")
    ).map((el) => ({
      name: el.querySelector(".price-comparison__grid__row__icon img")?.alt,
      logo_url: el.querySelector(".price-comparison__grid__row__icon img")?.src,
      type: "vod",
      link: window.location.href,
    }));
  });

  await browser.close();
  return providers;
}

// -------- AlloCiné (cinéma) --------
async function scrapeAlloCine(title) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "stylesheet", "font"].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(
    `https://www.allocine.fr/recherche/?q=${encodeURIComponent(title)}`,
    {
      waitUntil: "domcontentloaded",
      timeout: 0,
    }
  );

  const firstLink = await page.$(".meta-title-link");
  if (!firstLink) {
    await browser.close();
    return [];
  }
  await firstLink.click();
  await page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 0 });

  // Scraper séances : exemple simplifié
  const sessions = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".showtimes-item")).map(
      (el) => ({
        cinema: el.querySelector(".theater-name")?.textContent.trim(),
        time: el.querySelector(".hour-item")?.textContent.trim(),
        link: window.location.href,
      })
    );
  });

  await browser.close();
  return sessions;
}

// -------- Télé-Loisirs (TV) --------
async function scrapeProgrammeTV(title) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    if (["image", "stylesheet", "font"].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });

  await page.goto(
    `https://www.programme-tv.net/recherche/?q=${encodeURIComponent(title)}`,
    {
      waitUntil: "domcontentloaded",
      timeout: 0,
    }
  );

  // Exemple simple : première diffusion trouvée
  const results = await page.evaluate(() => {
    return Array.from(document.querySelectorAll(".search-results__item")).map(
      (el) => ({
        title: el
          .querySelector(".search-results__item-title")
          ?.textContent.trim(),
        date: el
          .querySelector(".search-results__item-date")
          ?.textContent.trim(),
        link: el.querySelector("a")?.href,
      })
    );
  });

  await browser.close();
  return results;
}

// -------- Root pour check --------
app.get("/", (req, res) => {
  res.send("✅ Bobby multi-source scraper is running");
});

app.listen(PORT, () => {
  console.log(`✅ Scraper backend listening on ${PORT}`);
});
