const socket = io()
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');


//fit canvas to window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const roomId = window.location.pathname.split('/')[2];

let drawing = false;
let prev= {x:0,y:0};
let color = '#000000';
let brushSize = 3;
let strokes = []; //local copy for undo

// ─── Toolbar ────────────────────────────────────────────────
document.getElementById('colorPicker').addEventListener('input', (e) => {
  color = e.target.value;
});

document.getElementById('brushSize').addEventListener('input', (e) => {
  brushSize = parseInt(e.target.value);
});

document.getElementById('undoBtn').addEventListener('click', () => {
  socket.emit('undo', { roomId });
});

document.getElementById('clearBtn').addEventListener('click', () => {
  socket.emit('clear', { roomId });
});

//Draw a single stroke segment
function drawStroke({prevX,prevY,x,y,color,width}){
    ctx.beginPath();
    ctx.moveTo(prevX,prevY);
    ctx.lineTo(x,y);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function redrawAll(strokes) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(drawStroke);
}

//Socket events 
socket.on('init',(savedStrokes)=>{
    strokes = savedStrokes;
    redrawAll(strokes);
});
//Recieve strokes from other users
socket.on('draw',(data)=>{
    strokes.push(data);
    drawStroke(data);
});

socket.on('undo', (updatedStrokes) => {
  strokes = updatedStrokes;
  redrawAll(strokes);
});

socket.on('clear', () => {
  strokes = [];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('connect', () => {
  const roomId = window.location.pathname.split('/')[2];
  console.log("Joining room:", roomId);
  if (roomId) {
    socket.emit('join-room', roomId);
  }
});

socket.on('user-count',(count)=>{
    document.getElementById('count').textContent = count;
})

socket.on('disconnect',()=>{
    console.log('Disconnected');
})

//Mouse events

canvas.addEventListener('mousedown',(e)=>{
    drawing = true;
    prev = { x: e.offsetX, y: e.offsetY };
})

canvas.addEventListener('mousemove',(e)=>{
    const roomId = window.location.pathname.split('/')[2];
    if(!drawing) return;

    const data = {
        prevX: prev.x,
        prevY: prev.y,
        x: e.offsetX,
        y: e.offsetY,
        color: color,
        width: brushSize,
        userId: socket.id,
        roomId: roomId
    }

    drawStroke(data);
    socket.emit('draw',data);
    prev = {x:data.x,y:data.y};
})

canvas.addEventListener('mouseup',()=> drawing = false);
canvas.addEventListener('mouseleave',()=>drawing = false);

// Resize canvas on window resize
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  redrawAll(strokes);
});