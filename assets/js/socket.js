import { Socket } from "phoenix";

let socket = new Socket("/socket", { params: { token: window.userToken } });

socket.connect();

const createSocket = topicId => {
  let channel = socket.channel(`comments:${topicId}`, {});
  channel
    .join()
    .receive("ok", resp => {
      console.log(resp);
      renderComments(resp.comments);
    })
    .receive("error", resp => {
      console.log("Unable to join", resp);
    });

  channel.on(`comments:${topicId}:new`, renderComment);

  document.querySelector("input").addEventListener("keydown", e => {
    if (e.keyCode == 13) {
      e.preventDefault();
      const content = document.querySelector("input").value;

      channel.push("content:add", { content: content });
      document.querySelector("input").value = "";
    }
  });
};

function renderComments(comments) {
  const renderedComments = comments.map(comment => {
    return commentTemplate(comment);
  });

  document.querySelector(".collection").innerHTML = renderedComments.join("");
}

function renderComment(event) {
  const renderedComment = commentTemplate(event.comment);

  document.querySelector(".collection").innerHTML += renderedComment;
}

function commentTemplate(comment) {
  return (
    '<li class="collection-item">' +
    safe_tags(comment.content) +
    `<div class="secondary-content">${comment.user.email}</div>` +
    "</li>"
  );
}

function safe_tags(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

window.createSocket = createSocket;
