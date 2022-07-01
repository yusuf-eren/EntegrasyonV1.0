const { response } = require("express");
const { get } = require("mongoose");
const fetch = require("node-fetch");
const User = require("../models/Users");
const Listing = require("../models/Listing");

exports.Auth = async (req, res) => {
  // The req.query object has the query params that Etsy authentication sends
  // to this route. The authorization code is in the `code` param
  const authCode = req.query.code;
  const tokenUrl = "https://api.etsy.com/v3/public/oauth/token";
  const requestOptions = {
    method: "POST",
    body: JSON.stringify({
      grant_type: "authorization_code",
      client_id: process.env.clientID,
      redirect_uri: process.env.redirectUri,
      code: authCode,
      code_verifier: process.env.clientVerifier,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(tokenUrl, requestOptions);

  // Extract the access token from the response access_token data field
  if (response.ok) {
    const tokenData = await response.json();
    res.redirect(`/main?access_token=${tokenData.access_token}`);
  } else {
    res.send("oops2");
    const tokenData = await response.json();
    console.log(tokenData);
  }
};

exports.Main = async (req, res) => {
  // We passed the access token in via the querystring
  const { access_token } = req.query;

  // An Etsy access token includes your shop/user ID
  // as a token prefix, so we can extract that too
  const user_id = access_token.split(".")[0];

  const requestOptions = {
    headers: {
      "x-api-key": process.env.clientID,
      // Scoped endpoints require a bearer token
      Authorization: `Bearer ${access_token}`,
    },
  };

  const response = await fetch(
    `https://api.etsy.com/v3/application/users/${user_id}`,
    requestOptions
  );

  if (response.ok) {
    const userData = await response.json();
    // Load the template with the first name as a template variable.
    res.render("main", {
      first_name: userData.first_name,
      user_id: userData.user_id,
      access_token: access_token,
    });
  } else {
    const userData = await response.json();
    console.log(requestOptions.headers);
    console.log(userData);
    res.send("oops");
  }
};

exports.GetListing = async (req, res) => {
  const user_id = await req.query.user_id;
  const access_token = await req.query.access_token;
  const requestOptions = {
    headers: {
      "x-api-key": process.env.clientID,
      // Scoped endpoints require a bearer token
      Authorization: `Bearer ${access_token}`,
    },
  };
  const get_shop_id = await fetch(
    `https://openapi.etsy.com/v3/application/users/${user_id}/shops`,
    requestOptions
  ).then((res) => res.json());
  //console.log(get_shop_id);
  const getListings = await fetch(
    `https://openapi.etsy.com/v3/application/shops/${get_shop_id.shop_id}/listings?limit=100`,
    requestOptions
  ).then((res) => res.json());

  // Ömrümden 1 saat yedi şu döngü. Helal olsun :)
  for (let i = 0; i < getListings["results"].length; i++) {
    Listing.findOne(
      { listing_id: getListings["results"][i].listing_id },
      async (err, data) => {
        if (data === null) {
          await Listing.create({
            shop_id: getListings["results"][i].shop_id,
            listing_id: getListings["results"][i].listing_id,
            title: getListings["results"][i].title,
            description: getListings["results"][i].description,
            quantity: getListings["results"][i].quantity,
          });
        } else {
          console.log("Already Fetched All Listings");
          console.log("New listings will be added if any..");
        }
      }
    );
  }
  res.redirect(`/view_listings?shop_id=${get_shop_id.shop_id}`);
  //console.log(getListings);
};

exports.ViewListings = async (req, res) => {
  const shop_id = req.query.shop_id;
  const totalListings = await Listing.find({
    shop_id: shop_id,
  }).countDocuments();
  const listings_of_shop_id = await Listing.find({ shop_id: shop_id });
  res.render("viewListings", {
    listings: listings_of_shop_id,
    listing_count: totalListings,
  });
};
