const axios = require("axios");
const cheerio = require("cheerio");
const converter = require("json-2-csv");
const fs = require("fs").promises;
const path = require("path");

// Headers configuration
const imdbHeadersConfig = {
  headers: {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.imdb.com/",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
  },
  gzip: true,
};

module.exports.extractData = async (imdbUrls) => {
  try {
    const data = [];
    for (let url of imdbUrls) {
      imdbHeadersConfig.uri = url;
      const res = await axios.get(url, imdbHeadersConfig);
      const $ = cheerio.load(res.data);
      const title = $("h1[data-testid='hero__pageTitle'] span").text();
      const rating = $("div[data-testid='hero-rating-bar__aggregate-rating__score'] span")
        .text()
        .split("/")[0];
      const summary = $("p[data-testid='plot'] > span").text();
      const poster = $("div[data-testid='hero-media__poster'] img").attr("src");
      data.push({
        title,
        rating,
        summary,
        poster,
        submittedURL: url,
      });
    }
    const csv = await converter.json2csv(data);
    await fs.writeFile(path.join(__dirname, "data", "imdb_data.csv"), csv);
    return data;
  } catch (error) {
    throw new Error(error.message)
  }
};
