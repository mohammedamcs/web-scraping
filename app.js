const express = require("express");
const ejsMate = require("ejs-mate");
const AppError = require("./AppError");
const { extractData } = require("./utlis");
const app = express();
const port = 3000;

//middleware for public files such as: images,css and js
app.use(express.static("public"));

// parse url/encoded data for body
app.use(express.urlencoded({ extended: true }));

// use ejs-locals for all ejs templates:
app.engine("ejs", ejsMate);

// Set View Engine
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Home page
app.get("/", (req, res) => {
  res.render("index");
});

// About page
app.get("/about", (req, res) => {
  res.render("about");
});

// Show Data
app.post("/show", async (req, res, next) => {
  try {
    const { urls } = req.body;
    // Check if urls exists
    if (!urls) throw new AppError(400, "Urls are not submitted");
    // Extract urls
    const imdbUrls = urls.split(",").filter((url) => url !== "");
    // Extract data from urls
    const data = await extractData(imdbUrls);
    res.render("show", { data });
  } catch (error) {
    next(error);
  }
});

// Download file - with no validation!
app.post("/download", (req, res) => {
  res.download("./data/imdb_data.csv");
});

// 404 handler
app.all("*", (req, res, next) => {
  next(new AppError(404, "Page Not Found"));
});

// Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "try again later" } = err;
  res.render("error", {
    error: {
      statusCode,
      message,
      stack: err.stack,
    },
  });
});

app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});
