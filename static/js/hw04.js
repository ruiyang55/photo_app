// const link = 'https://photo-app-demo.herokuapp.com/api/'
const link = 'http://127.0.0.1:5000/api'
// const link = 'https://lilchat.herokuapp.com/api'
// const link = 'https://lilchat.herokuapp.com/api'


// fetch data from your API endpoint:
const displayStories = () => {
  const story2Html = story => {
    return `
        <div>
            <img src="${story.user.thumb_url}" class="pic" alt="profile pic for ${story.user.username}" />
            <p>${story.user.username}</p>
        </div>
    `;
  };
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.stories').innerHTML = html;
        })
};


const displaySuggestions = () => {
  const suggestion2Html = user => {
    return `
    <section id='suggestion${user.id}' >
      <img class='pic' src="${user.thumb_url}" />
      <div>
        <p class="username">${user.username}</p>
        <p class="suggestion-text">suggested for you</p>
      </div>
      <div>
        <button 
          class="" 
          aria-label="Follow"
          aria-checked="false"
          data-user-id="${user.id}" 
          onclick="toggleFollow(event)"
        >follow</button >
      </div>
    </section>`
  };
  
  fetch(`${link}/suggestions/`)
    .then(response => response.json())
    .then(users => {
      const html = users.map(suggestion2Html).join('\n');
      document.querySelector('#suggestions').innerHTML = html;
    });
};

const displayPosts = () => {
  const post2Html = post => {
    // console.log(post.current_user_bookmark_id)
    
    return `
    <section class="card" id="postWithId${post.id}">
      <div class="header"><h3>${post.user.username}</h3><i class="fa fa-dots"></i></div>
      <img src="${post.image_url}}" alt="Image posted by ${post.user.username}" width="300" height="300">
      <div class="info">
        <div class="buttons">
          <div>
            <button role="switch" class="like" aria-label="Like Button" 
              aria-checked="${post.current_user_like_id !== undefined ? "true":"false" }" 
              data-post-id="${post.id}"
              ${post.current_user_like_id !== undefined ? `data-like-id="${post.current_user_like_id}"`:''}
              onclick="toggleLike(event)">
              <i class="${post.current_user_like_id !== undefined ? "fas fa-heart liked" : "far fa-heart"}"></i>
              </button>
              <i class="far fa-comment"></i>
              <i class="far fa-paper-plane"></i>
              </div>
              <div>
              <button role="switch" class="bookmark" aria-label="Bookmark Button" 
                aria-checked="${post.current_user_bookmark_id !== undefined ? "true" : "false" }" 
                ${post.current_user_bookmark_id !== undefined ? `data-bookmark-id="${post.current_user_bookmark_id}"`:''}
                data-post-id="${post.id}"
                onclick="toggleBookmark(event)">
              <i class="${post.current_user_bookmark_id !== undefined ? "fas fa-bookmark bookmarked" : "far fa-bookmark"}"></i>
            </button>
          </div>
        </div>
        <p class="likes"><strong>${post.likes.length} like${post.likes.length == 1 ? '' : 's'}</strong></p>
        <div class="caption">
          <p><strong>${post.user.username}</strong> ${post.caption}</p>
          <p class="timestamp">${post.display_time}</p>
          </div>
          <div data-comment-count = "${post.comments.length}" data-post-id="${post.id}">${post.comments.length > 1 ? `<button class="link" onclick="popupModal(event)">View all ${post.comments.length} comments</button>` : ``}</div>
          ${post.comments.length > 0 ? `
            <div class="comments">
            <div>
            <p><strong>${post.comments[post.comments.length - 1].user.username}</strong> ${post.comments[post.comments.length - 1].text}</p>
            <p class="timestamp">${post.comments[post.comments.length - 1].display_time}</p>
            </div>
            </div>
            `: '<div class="comments"></div>'
          }
      </div>
      <form class="add-comment" onsubmit="return false">
        <div class="input-holder">
          <input class="comment-textbox" 
          aria-label="Add a comment" 
          placeholder="Add a comment..." 
          value=""
          >
        </div>
        <button class="link" data-post-id="${post.id}" onclick=addComment(event)>Post</button>
      </form>
    </section>`
  }
  fetch(`${link}/posts/?limit=2`)
    .then(response => response.json())
    .then(posts => {
      console.log(posts)
      const html = posts.map(post2Html).join('\n');
      document.querySelector('#posts').innerHTML = html;
    });
};

const toggleFollow = ev => {

  const createFollower = (userId, elem) => {
    const postData = {
      "user_id": userId
    };
    fetch(`${link}/following/`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        elem.innerHTML = 'unfollow'
        elem.setAttribute('data-following-id', data.id)
        elem.setAttribute('aria-checked', 'true');
      })
      .catch(e => {
        console.log(e)
      })
  }

  const deleteFollower = (followingId, elem) => {
    fetch(`${link}/following/${followingId}`, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        elem.innerHTML = 'follow'
        elem.removeAttribute('data-following-id');
        elem.setAttribute('aria-checked', 'false');
      })
  }

  const elem = ev.currentTarget;
  console.log(elem.dataset.userId)
  elem.classList.toggle("unfollow");
  if (elem.getAttribute('aria-checked') === 'false') {
    createFollower(elem.dataset.userId, elem)
  } else {
    deleteFollower(elem.dataset.followingId, elem)
  }
}

const toggleLike = ev => {
  const elem = ev.currentTarget;
  if (elem.getAttribute('aria-checked') === 'false') {
    const postData = {
      "post_id": elem.dataset.postId
    };
    fetch(link+"/posts/likes/", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      elem.setAttribute('aria-checked', 'true');
      elem.setAttribute('data-like-id', data.id);
      ["liked", "far", "fas"].map(c => elem.children[0].classList.toggle(c))
    });
  } else {
    fetch(link + "/posts/likes/" + elem.dataset.likeId, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      elem.setAttribute('aria-checked', 'false');
      ["liked", "far", "fas"].map(c => elem.children[0].classList.toggle(c))
    });
  }
  
  
}

const toggleBookmark = ev => {
  const elem = ev.currentTarget;
  if (elem.getAttribute('aria-checked') === 'false') {
    const postData = {
      "post_id": elem.dataset.postId
    };
    fetch(link+"/bookmarks/", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      ["bookmarked", "far", "fas"].map(c => elem.children[0].classList.toggle(c))
      elem.setAttribute('aria-checked', 'true');
      elem.setAttribute('data-bookmark-id',data.id);
    });
  } else {
    fetch(link+"/bookmarks/"+elem.dataset.bookmarkId, {
      method: "DELETE",
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      ["bookmarked", "far", "fas"].map(c => elem.children[0].classList.toggle(c))
      elem.removeAttribute('data-bookmark-id');
      elem.setAttribute('aria-checked', 'false');
    });
  }
  
}

const addComment = (ev) => {
  console.log(ev);
  var elem = ev.currentTarget;
  const postData = {
    "post_id": elem.dataset.postId,
    "text": elem.previousElementSibling.children[0].value
  };

  fetch(link+"/comments", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData)
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      elem.parentElement.previousElementSibling.children[4].innerHTML = `
        <div>
          <p><strong>${data.user.username}</strong> ${data.text}</p>
          <p class="timestamp">${data.display_time}</p>
        </div>
      `
      elem.parentElement.reset()
      elem.previousElementSibling.children[0].focus()
      elem = elem.parentElement.previousElementSibling.children[3]
      console.log(elem)
      cnt = parseInt(elem.dataset.commentCount) + 1
      elem.setAttribute('data-comment-count', cnt)
      elem.innerHTML = cnt > 1 ? `<button class="link" onclick="popupModal(event)">View all ${cnt} comments</button>` : '<div data-comment-count="1"></div>'
    });
}

const popupModal = (ev) => {
  id = ev.currentTarget.parentElement.dataset.postId
  fetch(link + "/posts/" + id, {
    method: "GET",
    headers: {
      'Content-Type': 'application/json',
    }
  })
    .then(response => response.json())
    .then(data => {
      console.log(data);
      document.getElementById('modal').classList.toggle('hidden')
      if (document.getElementById('modal').getAttribute('aria-hidden')=='true'){
        document.getElementById('modal').setAttribute('aria-hidden','false')
      } else {
        document.getElementById('modal').setAttribute('aria-hidden','true')
      }
      document.getElementById('modal').innerHTML = `
      <div class="modal-bg">
        <button class="close" aria-label="Close Button" 
          onclick="(()=>{
            document.getElementById('modal').classList.toggle('hidden');
            document.querySelector('#postWithId${data.id} > div.info > div:nth-child(4) > button').focus();
          })()"
        ><i class="fas fa-times"></i></button>
        <div class="modal" role="dialog" aria-live="assertive">
          <div class="featured-image" style="background-image: url('${data.image_url}')">
          </div>
          <div class="container">
            <h3><img class="pic" alt="Profile of the person who created the post" src="${data.user.thumb_url}">
              ${data.user.username}</h3>
            <div class="body">
              ${ data.comments.map(c=>{
                return `<div classs="comments">
                  <img class='pic' src="${c.user.thumb_url}" />
                  <div> 
                    <p><strong>${c.user.username}</strong></p>
                    <p> ${c.text} </p>
                    <p class="timestamp">${c.display_time}</p>
                  </div>
                  <button role="switch" class="like" aria-label="Like Button">
                    <i class="far fa-heart"></i>
                  </button>
                </div>`
              }).join('\n')}
            </div>
          </div>
        </div>
      </div>
      `
      document.querySelector("#modal > div > button").focus()
      var focusRange = document.getElementById('modal').querySelectorAll('button:not([disabled])')
      var focusBeg = focusRange[0]
      var focusEnd = focusRange[focusRange.length-1]
      document.getElementById('modal').addEventListener('keydown', e=>{
        if (e.key !== 'Tab') { return }
        if (e.shiftKey) {
          if (document.activeElement == focusBeg ) {focusEnd.focus(); e.preventDefault()}
        } else {
          if (document.activeElement == focusEnd ) {focusBeg.focus(); e.preventDefault()}
        }
      })
    });
}



// invoke init page to display stories:
displayStories();
displaySuggestions();
displayPosts();
