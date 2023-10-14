var express = require("express");
var router = express.Router();
const axios = require("axios");
const s3 = require("../s3/s3");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Travel Advisor" });
});

//=========get page counter=================================================================
router.get("/api/pagecounter", async function (req, res) {
  let data = await s3.getObjectFromS3();
  console.log(data);
  if (data) {
    const newData = {
      pageCounter: data?.pageCounter + 1,
    };
    await s3.uploadJsonToS3(newData);
    res.json(newData);
  }
});

//=========get weather conditions=================================================================
router.get("/api/weather", async function (req, res) {
  const options = {
    method: "GET",
    url: "https://weatherapi-com.p.rapidapi.com/current.json",
    params: { q: req.query?.q },
    headers: {
      "X-RapidAPI-Key": process.env.WEATHER_API_KEY,
      "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    res.json(response.data);
  } catch (error) {
    console.error(error);
  }
});

//=========get restaurants information=================================================================
router.get("/api/travel", async (req, res) => {
  const API_KEY = process.env.TRAVEL_ADVISOR_KEY;
  const URL_RESTAURANTS =
    "https://travel-advisor.p.rapidapi.com/restaurants/list-in-boundary";
  const URL_ATTRACTIONS =
    "https://travel-advisor.p.rapidapi.com/attractions/list-in-boundary";

  //==== sort function 1 ====
  function sort1(array, key) {
    const afterProcess = array?.filter(
      (place) =>
        place.name && place.rating && place.rating > 4 && place.num_reviews > 0
    );

    return afterProcess?.sort(function (a, b) {
      let x = Number(a[key]);
      let y = Number(b[key]);
      return x > y ? -1 : x < y ? 1 : 0;
    });
  }

  //==== sort function 1 ====
  function sort2(array, key) {
    const afterProcess = array?.filter(
      (place) => place.name && place.rating && place.num_reviews > 0
    );

    return afterProcess?.sort(function (a, b) {
      let x = Number(a[key]);
      let y = Number(b[key]);
      return x > y ? -1 : x < y ? 1 : 0;
    });
  }

  try {
    const response = await Promise.all([
      axios.get(URL_RESTAURANTS, {
        params: {
          tr_latitude: req.query.tr_lat,
          tr_longitude: req.query.tr_lng,
          bl_latitude: req.query.bl_lat,
          bl_longitude: req.query.bl_lng,
        },
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
        },
      }),
      axios.get(URL_ATTRACTIONS, {
        params: {
          tr_latitude: req.query.tr_lat,
          tr_longitude: req.query.tr_lng,
          bl_latitude: req.query.bl_lat,
          bl_longitude: req.query.bl_lng,
        },
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
        },
      }),
    ]);

    //==== (1) fetch and process api data: restaurants ====
    const restaurant_rating = sort1(response[0]?.data.data, "rating");
    const restaurant_num_reviews = sort1(response[0]?.data.data, "num_reviews");

    //==== (2) fetch and process api data: attractions ====
    const attraction_rating = sort2(response[1]?.data.data, "rating");
    const attraction_num_reviews = sort2(response[1]?.data.data, "num_reviews");

    const restaurants_rating = restaurant_rating?.map((i) => ({
      name: i.name ? i.name : "No Data!",
      rating: i.rating ? i.rating : "No Data!",
      num_reviews: i.num_reviews ? i.num_reviews : "No Data!",
      ranking: i.ranking ? i.ranking : "No Data!",
      address: i.address ? i.address : "No Data!",
      latitude: i.latitude,
      longitude: i.longitude,
      phone: i.phone ? i.phone : "No Data!",
      cuisine: i.cuisine ? i.cuisine : "No Data!",
      website: i.website ? i.website : "No Data!",
      photo: i.photo ? i.photo : "No Data!",
    }));
    const restaurants_num_reviews = restaurant_num_reviews?.map((i) => ({
      name: i.name ? i.name : "No Data!",
      rating: i.rating ? i.rating : "No Data!",
      num_reviews: i.num_reviews ? i.num_reviews : "No Data!",
      ranking: i.ranking ? i.ranking : "No Data!",
      address: i.address ? i.address : "No Data!",
      latitude: i.latitude,
      longitude: i.longitude,
      phone: i.phone ? i.phone : "No Data!",
      cuisine: i.cuisine ? i.cuisine : "No Data!",
      website: i.website ? i.website : "No Data!",
      photo: i.photo ? i.photo : "No Data!",
    }));

    const attractions_rating = attraction_rating?.map((i) => ({
      name: i.name ? i.name : "No Data!",
      rating: i.rating ? i.rating : "No Data!",
      num_reviews: i.num_reviews ? i.num_reviews : "No Data!",
      ranking: i.ranking ? i.ranking : "No Data!",
      address: i.address ? i.address : "No Data!",
      latitude: i.latitude,
      longitude: i.longitude,
      phone: i.phone ? i.phone : "No Data!",
      website: i.website ? i.website : "No Data!",
      photo: i.photo ? i.photo : "No Data!",
    }));

    const attractions_num_reviews = attraction_num_reviews?.map((i) => ({
      name: i.name ? i.name : "No Data!",
      rating: i.rating ? i.rating : "No Data!",
      num_reviews: i.num_reviews ? i.num_reviews : "No Data!",
      ranking: i.ranking ? i.ranking : "No Data!",
      address: i.address ? i.address : "No Data!",
      latitude: i.latitude,
      longitude: i.longitude,
      phone: i.phone ? i.phone : "No Data!",
      website: i.website ? i.website : "No Data!",
      photo: i.photo ? i.photo : "No Data!",
    }));

    res.json({
      restaurants_rating: restaurants_rating,
      restaurants_num_reviews: restaurants_num_reviews,
      attractions_rating: attractions_rating,
      attractions_num_reviews: attractions_num_reviews,
    });
  } catch (error) {
    console.error(error);
  }
});

//  fake get api
// router.get("/api/travel", async (req, res) => {
//   function sort1(array, key) {
//     const afterProcess = array?.filter(
//       (place) =>
//         place.name && place.rating && place.rating > 4 && place.num_reviews > 0
//     );

//     return afterProcess?.sort(function (a, b) {
//       let x = Number(a[key]);
//       let y = Number(b[key]);
//       return x > y ? -1 : x < y ? 1 : 0;
//     });
//   }

//   function sort2(array, key) {
//     const afterProcess = array?.filter(
//       (place) => place.name && place.rating && place.num_reviews > 0
//     );

//     return afterProcess?.sort(function (a, b) {
//       let x = Number(a[key]);
//       let y = Number(b[key]);
//       return x > y ? -1 : x < y ? 1 : 0;
//     });
//   }

//   try {
//     setTimeout(() => {
//       res.json({
//         restaurants_rating: fakeData.restaurants_rating,
//         restaurants_num_reviews: fakeData.restaurants_num_reviews,
//         attractions_rating: fakeData.attractions_rating,
//         attractions_num_reviews: fakeData.attractions_num_reviews,
//       });
//     }, 500);
//   } catch (error) {
//     console.error(error);
//   }
// });

module.exports = router;
