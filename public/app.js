
$(document).on("click", ".scrape-site", () => {
  $.ajax({
    method: "GET",
    url: "/scrape",
  })
  .then((data) => {
    console.log(data)
    if (data ==="OK"){
      window.location.assign("/");
    }
  })
})

$(document).on("click", ".save-news", function (event) {
  data = {id: this.id}
  $.ajax({
    method: "PUT",
    url: "/article",
    data: data
  })
  .then(function (response){
    window.location.assign("/myarticles");

  })
})
$(".delete-article").on("click", function(event){
  // Send the DELETE request.
  $.ajax("/article/" + $(this).attr("del-id"), {
      type: "DELETE"
    })
    .done(
      function() {
        // Reload the page to get the updated list
        location.reload();
      }
    );
})
$(".add-comment").on("click", function(event){
  const articleID = $(this).attr("article-id")

    $.ajax({
    method: "POST",
    url: "/notes/" + articleID,
    data: {
      body: $( "[comment-id="+articleID+"]" ).val()
    }
  })
    // With that done
    .then(function(data) {
      location.reload();
    });
})
$(".delete-comment").on("click", function(event){
  console.log(this.id)
  $.ajax("/note/" + this.id, {
    type: "DELETE"
  })
  .done(
    function() {
      // Reload the page to get the updated list
      location.reload();
    }
  );
})

