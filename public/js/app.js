render(window.location.hash);

const msg = document.getElementById("msg");
const msgpv = document.getElementById("msgpv");
const send = document.getElementById("send");
const sendpv = document.getElementById("sendpv");
const leave = document.getElementById("leave");
const chatDiv = document.querySelector(".chat-messages");
const chatDivpv = document.querySelector(".chat-messagespv");
const ul_navbar = document.getElementById("ul_navbar");

var socket = io();

socket.on("connect", () => {
  socket.emit("login");
});

socket.on("id", (id, users) => {
  user = document.getElementById("id");
  if (user.innerText == "") {
    user.innerText = id;
  }
  ul_navbar.innerHTML = "";
  const public = document.createElement("li");
  public.classList.add("navli");
  public.user = user;
  public.innerHTML = `<a href="#public" class="a" id="public" style="color: white">Public</a>`;
  ul_navbar.appendChild(public);
  users.forEach((user) => {
    const li = document.createElement("li");
    li.classList.add("navli");
    li.user = user;
    li.innerHTML = `<a href="#private" class="a" id="${user}" style="color: white">${user}</a>`;
    ul_navbar.appendChild(li);
  });
});

socket.on("messagePublic", (message, username) => {
  chatDiv.scrollTop = chatDiv.scrollHeight;
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${username}</p>
  <p class="text">
    ${message}
  </p>`;
  chatDiv.appendChild(div);
});

socket.on("messagePrivate", (message, username) => {
  chatDivpv.scrollTop = chatDivpv.scrollHeight;
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${username}</p>
  <p class="text">
    ${message}
  </p>`;
  chatDivpv.appendChild(div);
});

socket.on("changeCookie", (name) => {
  document.cookie = "room=" + name + ";";
});

send.addEventListener("click", () => {
  var message = msg.value;
  socket.emit("chatMessage", document.cookie, message);
  msg.value = "";
  msg.focus();
});

sendpv.addEventListener("click", () => {
  var messagepv = msgpv.value;
  console.log(document.cookie);
  socket.emit("chatMessagePrivate", document.cookie, messagepv);
  msgpv.value = "";
  msgpv.focus();
});

leave.addEventListener("click", () => {
  user = document.getElementById("id");
  socket.emit("leave", user.innerText);
});

window.onhashchange = function () {
  render(window.location.hash);
};

function render(hashKey) {
  //first hide all divs
  let pages = document.querySelectorAll(".page");
  for (let i = 0; i < pages.length; ++i) {
    pages[i].style.display = "none";
  }
  let a_user = document.querySelectorAll(".a");
  a_user.forEach((element) => {
    element.addEventListener("click", () => {
      socket.emit("changeRoom", element.id);
    });
  });

  switch (hashKey) {
    case "":
      pages[0].style.display = "block";
      break;
    case "#public":
      pages[1].style.display = "block";
      break;
    case "#private":
      pages[2].style.display = "block";
      break;
    default:
      pages[0].style.display = "block";
  }
}
