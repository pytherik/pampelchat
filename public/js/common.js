$('#postTextarea, #replyTextarea').keyup( e => {
  const textbox = $(e.target)
  const value = textbox.val().trim()
  
  const isModal = textbox.parents(".modal").length == 1;
  
  const submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");
 
  if (submitButton.length == 0) return alert("No Submit Button found");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }
  submitButton.prop("disabled", false);

})
  
$("#submitPostButton, #submitReplyButton").click((event) => {
  const button = $(event.target);

  const isModal = button.parents(".modal").length == 1;
  const textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

  const data = {
    content: textbox.val()
  };

  if (isModal) {
    const id = button.data().id;
    if (id == 0) return alert("Button id is null!");

    data.replyTo = id;
  }

  $.post("/api/posts", data, postData => {

    if (postData.replyTo) {
      location.reload();
    }
    else {
      const html = createPostHtml(postData);
      $(".postsContainer").prepend(html);
      textbox.val("");
      button.prop("disabled", true);
    }

  })
})

$("#replyModal").on("show.bs.modal", (e) => {
  const button = $(e.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#submitReplyButton").data("id", postId);
  
  $.get("/api/posts/" + postId, results => {
    outputPosts(results.postData, $("#originalPostContainer"));
  })
})

$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""))

$("#deletePostModal").on("show.bs.modal", (e) => {
  const button = $(e.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#deletePostButton").data("id", postId);
})

$("#deletePostButton").click(() => {
  
  alert($("#deletePostButton").data().id);
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
    }
  })
})

$(document).on("click", ".retweetButton", (e) => {
  const button = $(e.target);
  const postId = getPostIdFromElement(button);

  if (postId === undefined) return;

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: "POST",
    success: (postData) => {
      button.find("span").text(postData.retweetUsers.length || "")
      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass("active");
      }
      else {
        button.removeClass("active");
      }
    }
  })
})

$(document).on("click", ".post", (e) => {
  const element = $(e.target);
  const postId = getPostIdFromElement(element);


  if (postId !== undefined && !element.is("button", "a")) {
    window.location.href = '/posts/' + postId;
  }
})
 
function getPostIdFromElement(element) {
  const isRoot = element.hasClass("post");
  const rootElement = isRoot ? element : element.closest(".post");
  const postId = rootElement.data().id;

  if (postId === undefined) return alert("Post ID undefined!");

  return postId;
}

function createPostHtml(postData, largeFont=false) {

  if (postData == null) return alert("post object is null!");

  const isRetweet = postData.retweetData != undefined;
  const retweetedBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetData : postData;

  const postedBy = postData.postedBy;

  if (postedBy._id === undefined) {
    return alert("User Object not populated!");
  }

  const displayName = `${postedBy.firstName} ${postedBy.lastName}`
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
  const retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? "active" : "";
  const largeFontClass = largeFont ? "largeFont" : "";


  let retweetText = '';
  if (isRetweet) {
    retweetText = `<span>
                     <i class="fas fa-retweet"></i>
                     Retweeted von <a href='/porfile/${retweetedBy}'>@${retweetedBy}</a>
                   </span>`; 
  }

  let replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) {

    if (!postData.replyTo._id) {
      return alert("Reply to is not populated");

    }
    else if (!postData.replyTo.postedBy._id) {
      console.log(postData.postedBy._id)
      return alert("Posted by is not populated");
    }

    const replyToUsername = postData.replyTo.postedBy.username;
    replyFlag = `<div class='replyFlag'>
                   Antwort an <a href='/profile/${replyToUsername}'>@${replyToUsername}
                 </div>`;
    }

  let buttons = "";
  if (postData.postedBy._id == userLoggedIn._id) {
    buttons = `<button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal"><i class="fas fa-times"></i></button>`
  }
  
  return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
            <div class='postActionContainer'>
              ${retweetText}
            </div>
            <div class='mainContentContainer'>
              <div class='userImageContainer'>
                <img src='${postedBy.profilePic}'>
              </div>
              <div class='postContentContainer'>
                <div class='header'>
                  <a href='/profile/@${postedBy.username}'>${displayName}</a>
                  <span class='username'>@${postedBy.username}</span>
                  <span class='date'>${timestamp}</span>
                  ${buttons}
                </div>
                ${replyFlag}
                <div class='postBody'>
                  <span>${postData.content}</span>
                </div>
                <div class='postFooter'>
                  <div class='postButtonContainer'>
                    <button data-toggle='modal' data-target='#replyModal'>
                      <i class="far fa-comment"></i>
                    </button>
                  </div>
                  <div class='postButtonContainer green'>
                    <button class='retweetButton ${retweetButtonActiveClass}'>
                      <i class="fas fa-retweet"></i>
                      <span>${postData.retweetUsers.length || ""}</span>
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

function outputPosts(results, container) {
  container.html("");

  if (!Array.isArray(results)) {
    results = [results];
  }
  results.forEach(result => {
    const html = createPostHtml(result);
    container.append(html);
  })
  if (results.length == 0) {
    container.append("<span class='noResults>Nichts zu berichten</span>");
  }
}

function outputPostsWithReplies(results, container) {
  container.html("");

  if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
    const html = createPostHtml(results.replyTo);
    container.append(html);
  }

  const mainPosthtml = createPostHtml(results.postData, true);
  container.append(mainPosthtml);

  results.replies.forEach(result => {
    const html = createPostHtml(result);
    container.append(html);
  })
  if (results.length == 0) {
    container.append("<span class='noResults>Nichts zu berichten</span>");
  }
}