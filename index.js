const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();

// Bloquer les ressources lourdes
await page.setRequestInterception(true);
page.on("request", (req) => {
  if (["image", "stylesheet", "font"].includes(req.resourceType())) {
    req.abort();
  } else {
    req.continue();
  }
});

// Goto avec timeout désactivé
await page.goto(
  `https://www.justwatch.com/fr/recherche?q=${encodeURIComponent(title)}`,
  {
    waitUntil: "domcontentloaded",
    timeout: 0,
  }
);

// Et pareil pour le reste
await page.waitForSelector(".title-list-row__row", { timeout: 0 });
