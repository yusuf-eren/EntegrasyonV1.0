require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const EtsyController = require("./controllers/EtsyControllers");
const PageController = require("./controllers/PageControllers");
const User = require("./models/Users");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", `${process.cwd()}/views`);

// MONGODB CONNECTION
mongoose
  .connect(
    "mongodb+srv://yusuf:allah1@etsyfetch.vaunvnx.mongodb.net/entegrasyon-v1?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected To Database");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", PageController.MainPage);

app.get("/reviews", async (req, res) => {});

const clientID = "6xhwtnjudbrqsjpocccu6dvx";
const clientVerifier = "RgbBE-RvukYnz1_8Rp93Mt5hVBoI_SxG19OcY53N_WI";
const redirectUri = "http://localhost:3003/oauth/redirect";

// ETSY CONTROLLERS
app.get("/oauth/redirect", EtsyController.Auth);
app.get("/main", EtsyController.Main);

app.get("/ad", EtsyController.GetListing);
app.get("/view_listings", EtsyController.ViewListings);
// Start the server on port 3003
const port = 3003;
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
