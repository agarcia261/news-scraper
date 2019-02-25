const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const exphbs  = require('express-handlebars');
//Define Port
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
 
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
console.log(MONGODB_URI)
console.log("the URI is " +process.env.MONGODB_URI )
mongoose.connect(MONGODB_URI);
// mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// Routes

require("./routes/htmlRoutes")(app);

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
