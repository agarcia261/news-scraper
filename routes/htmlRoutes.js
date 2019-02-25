const mongoose = require("mongoose");

// Require all models
var db = require("../models");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

module.exports = function(app) {

app.get('/', function (req, res) {
    db.Article.find({saved:false})
    .then(function(data) {
        console.log(data.length)
        if (data){        
            res.render('index', {
                data, 
                index:true,
                length:data.length
            });
        }
        else{
            res.render('index')
        }
    });
});

  // A GET route for scraping the echoJS website
  app.get("/scrape", function(req, res) {
    db.Article.deleteMany({ saved: false }, function (err) {
        if (err) return handleError(err);
        // deleted at most one tank document
      });
    // First, we grab the body of the html with axios
    axios.get("https://www.nytimes.com").then(function(response) {
        console.log("test")
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $(".css-8atqhb").each(function(i, element) {
        // Save an empty result object
        var result = {};
        // console.log(element)
  
        // Add the text and href of every link, and save them as properties of the result object
        result.title = $(this).find($('.esl82me2')).text()
        // $(element).children().text();
        // $(this)
        // .attr("class","esl82me2")

        // //   .children("a")
        //   .text();
        if($(this).find($('.e1n8kpyg1')).children().text()){
            result.summary = $(this).find($('.e1n8kpyg1')).children().text()

        }
        else{
            result.summary = "No summary available for this subject"
        }
        //   .children()
        //   .children("li")
          
        result.link = "https://www.nytimes.com"+$(element).find("a").attr("href");
        // "www.nytimes.com"+$(this)
        // .parent()
        // .attr("href");
        // console.log(result)

  
        // Create a new Article using the `result` object built from scraping
        db.Article.create(result)
          .then(function(dbArticle) {
                          // View the added result in the console
            //console.log(dbArticle);
            // res.render('articles',dbArticle);


          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
      res.status(200).send("OK");

  
      // Send a message to the client
    });
  });
  
  // Route for getting all Articles from the db
  app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for saving/updating an Article's associated Note
  app.post("/notes/:id", function(req, res) {
      console.log(req.body)
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: {note: dbNote._id }}, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  app.put("/article", function(req, res) {
    db.Article.update({_id:req.body.id}, {$set: { saved: true }}
    ).then(function(response) {
        return db.Article.deleteMany({ saved: false });
    })
    .then(function (response){

        res.status(200).send(req.body.id);
    })
    .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  app.delete("/article/:id", function(req, res) {

    db.Article.deleteOne({_id:req.params.id},function (err) {
      if (err){
        return res.status(404).end();
      }
      return res.status(200).end();
    });
  });
  app.get("/myarticles", function(req, res) {
    db.Article.find({ saved: true })
    .populate("note")
    .then(function(data) {
        console.log(data)
        if (data){        
            res.render('index', {
                data,
                modalnotes:true});
        }
        else{
            res.render('index')
        }
    });
  });
  app.delete("/note/:id", function(req, res) {
      console.log(req.params.id)

    db.Article.findOneAndUpdate({note: { $in : [req.params.id]} }, { $pull: {note: req.params.id }}, { new: true });

    // db.Article.update( {note: { $in : [req.params.id]} }, { $pull: {note: req.params.id} } )


    // db.Article.deleteOne({_id:req.params.id},function (err) {
    //   if (err){
    //     return res.status(404).end();
    //   }
    //   return res.status(200).end();
    // });
  });
  
}