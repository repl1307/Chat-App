const socket = io();
let username = ""//prompt("Enter your name");
let lastId = null;
let lastMessageTime = null;

socket.on('connect', () => {
  if(username == null || username == "") {
    username = "Guest-"+socket.id;
  }
});
socket.on('chat message', (message) => {
  if(message.isAnnouncement){
    displayAnnouncement(message);
  }
  else{
    displayMessage(message);
    lastId = message.id;
    lastMessageTime = Date.now();
  }
});

//event listeners
const textarea = document.querySelector('.input-container textarea');
textarea.addEventListener('input', e => {
  e.target.rows = countLines(textarea);
  console.log(countLines(textarea));
});
document.getElementById('send-message').addEventListener('click', e => {
  sendMessage();
});

//send message by pressing Shift + Enter
let shiftKey = false;
let enterKey = false;
document.addEventListener('keydown', e => {
  if(e.key == 'Shift')
    shiftKey = true;
  if(e.key == 'Enter')
    enterKey = true;
  if(shiftKey && enterKey){
    e.preventDefault();
    sendMessage()
  }
});
document.addEventListener('keyup', e => {
  setTimeout(() => {
  if(e.key == 'Shift')
    shiftKey = false;
  if(e.key == 'Enter')
    enterKey = false;
  }, 50);
});

//send message
function sendMessage(){
  const images = [];
  for(const c of document.querySelector('.image-preview').children){
    images.push(c.src);
  }
  const message = document.querySelector('.input-container textarea').value;
  if(message == '' && images.length == 0) return;
  socket.emit('chat message', message, images, username);
  document.querySelector('.image-preview').textContent = '';
  textarea.value = '';
  textarea.rows = 1;
}

document.querySelector('.input-container input[type=file]').addEventListener('change', previewImage);
//preview image
function previewImage(e){
  encodeImageFileAsURL(e.target).then(res => {
    console.log(res)
    const img = document.createElement('img');
    img.src = res;
    document.querySelector('.image-preview').appendChild(img);
    //detailed view of image
    img.addEventListener('click', e => {
      e.preventDefault();
      const dialog = document.getElementById('detailed-image-view');
      const dialogImg = document.querySelector('#detailed-image-view img');
      dialogImg.src = img.src;
      dialog.showModal();
    });
  });
}
async function encodeImageFileAsURL(element) {
  const file = element.files[0];
  const reader = new FileReader();

  const promise = new Promise(resolve => {
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(file);
  });
  return promise;
}

//display announcement 
function displayAnnouncement(message){
  const messageContainer = document.querySelector('.message-container');
  const messageElement = document.createElement('div');
  messageElement.classList.add('announcement');

  const p = document.createElement('p');
  p.textContent = message.content;

  messageElement.appendChild(p);
  messageContainer.appendChild(messageElement);

  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}
//display message
function displayMessage(message){
  const {name, content, time, id, images} = message;

  //message container and element
  const messageContainer = document.querySelector('.message-container');
  const messageElement = document.createElement('div');
  messageElement.classList.add(id == socket.id? 'sent-message' : 'received-message');

  //image message bubbles
  for(const imageURL of images){
    const bubble = document.createElement('div');
    const img = document.createElement('img');
    img.src = imageURL;
    bubble.appendChild(img);
    bubble.classList.add('message-bubble');
    bubble.style.marginBottom = '2px';
    messageElement.appendChild(bubble);
    //detailed view of image
    bubble.addEventListener('click', e => {
      e.preventDefault();
      const dialog = document.getElementById('detailed-image-view');
      const dialogImg = document.querySelector('#detailed-image-view img');
      dialogImg.src = img.src;
      dialog.showModal();
    });
  }
  //message text
  if(content){
    //message bubble text
    const messageP = document.createElement('p');
    messageP.textContent = content;
  
    //message bubble
    const bubble = document.createElement('div');
    bubble.appendChild(messageP);
    bubble.classList.add('message-bubble');
    messageElement.appendChild(bubble);
  }
  //if last message was sent by same user less than 2 minutes ago,
  // display messages as a group
  if(lastId == id && lastMessageTime >= Date.now() - 1000 * 60 * 2){
    messageContainer.lastChild.lastChild.remove();
    messageContainer.lastChild.lastChild.remove();
    messageElement.style.marginTop = '2px';
  }

  //username element
  const usernameP = document.createElement('p');
  usernameP.classList.add('username');
  usernameP.textContent = name;
  messageElement.appendChild(usernameP);

  //timestamp element
  const timeP = document.createElement('p');
  timeP.classList.add('timestamp');
  timeP.textContent = calcTime(time);
  updateTimeList.push({
    elem: timeP,
    time: time,
  });
  messageElement.appendChild(timeP);

  messageContainer.appendChild(messageElement);
  messageElement.scrollIntoView(false);
}

const updateTimeList = [];

setInterval(() => {
  for(const obj of updateTimeList){
    obj.elem.textContent = calcTime(obj.time);
  }
}, 1000);
function calcTime(time){
  const diff = Date.now() - time;
  //second, minute, hour, and day as milliseconds
  const sec = 1000;
  const min = sec * 60;
  const hour = min * 60;
  const day = hour * 24;
  if(diff > day)
    return 'Sent '+ Math.floor(diff/day) + (Math.floor(diff/day) > 1?' days ago' : ' day ago');
  else if(diff > hour)
    return 'Sent '+ Math.floor(diff/hour) + (Math.floor(diff/hour) > 1?' hours ago' : ' hour ago');
  else if(diff > min)
    return 'Sent '+ Math.floor(diff/min) + (Math.floor(diff/min) > 1?' minutes ago' : ' minute ago');
  else if(diff >= sec * 10)
    return 'Sent '+ Math.floor(diff/sec/10)*10 + (Math.floor(diff/sec) > 1?' seconds ago' : ' second ago');
  else 
    return 'Sent Now';
}
