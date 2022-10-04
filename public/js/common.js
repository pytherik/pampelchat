$('#postTextarea').keyup( e => {
  const textbox = $(e.target)
  const value = textbox.val().trim()
 
  const submitButton = $("#submitPostButton");
 
  if (submitButton.length == 0) return alert("No Submit Button found");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }
  submitButton.prop("disabled", false);

})
  
$("#submitPostButton").click((event) => {
  const button = $(event.target);
  const textbox = $("#postTextarea");

  const data = {
    content: textbox.val()
  };

  $.post("/api/posts", data, postData => {

    const html = createPostHtml(postData);
    $(".postsContainer").prepend(html);
    textbox.val("");
    button.prop("disabled", true);
  })
})

$(document).on("click", ".likeButton", (e) => {
  const button = $(e.target);
  const postId = getPostIdFromElement(button);

  if (postId === undefined) return;

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: "PUT",
    success: (postData) => {
      button.find("span").text(postData.likes.length || "")
      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
      }
      else {
        button.removeClass("active");
      }
      console.log(postData.likes.length);
    }
  })
})

function getPostIdFromElement(element) {
  const isRoot = element.hasClass("post");
  const rootElement = isRoot ? element : element.closest(".post");
  const postId = rootElement.data().id;

  if (postId === undefined) return alert("Post ID undefined!");

  return postId;
}

function createPostHtml(postData) {

  const postedBy = postData.postedBy;

  if (postedBy._id === undefined) {
    return alert("User Object not populated!");
  }

  const displayName = `${postedBy.firstName} ${postedBy.lastName}`
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
  
  return `<div class='post' data-id='${postData._id}'>
            <div class='mainContentContainer'>
              <div class='userImageContainer'>
                <img src='${postedBy.profilePic}'>
              </div>
              <div class='postContentContainer'>
                <div class='header'>
                  <a href='/profile/@${postedBy.username}'>${displayName}</a>
                  <span class='username'>@${postedBy.username}</span>
                  <span class='date'>${timestamp}</span>
                </div>
                <div class='postBody'>
                  <span>${postData.content}</span>
                </div>
                <div class='postFooter'>
                  <div class='postButtonContainer'>
                    <button>
                      <i class="far fa-comment"></i>
                    </button>
                  </div>
                  <div class='postButtonContainer green'>
                    <button class='retweet'>
                      <i class="fas fa-retweet"></i>
                    </button>
                  </div>
                  <div class='postButtonContainer red'>
                    <button class='likeButton ${likeButtonActiveClass}'>
                      <i class="far fa-heart"></i>
                      <span>${postData.likes.length || ""}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>`
}
function timeDifference(current, previous) {

  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {   
    return 'gerade eben';   
  }

  else if (elapsed < msPerHour) {
    return `vor ${Math.round(elapsed/msPerMinute)} Minuten`;   
  }

  else if (elapsed < msPerDay ) {
    return `vor ${Math.round(elapsed/msPerHour )} Stunden`;   
  }

  else if (elapsed < msPerMonth) {
    return `vor ${Math.round(elapsed/msPerDay)} Tagen`;   
  }

  else if (elapsed < msPerYear) {
    return `vor ${Math.round(elapsed/msPerMonth)} Monaten`;   
  }

  else {
    return `vor ${Math.round(elapsed/msPerYear)} Jahren`;   
  }
}