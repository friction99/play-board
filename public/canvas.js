const socket = io()
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

let drawing = false;
let prev= {x:0,y:0};

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
//Socket events 
socket.on('init',(strokes)=>{
    strokes.forEach(drawStroke);
});
//Recieve strokes from other users
socket.on('draw',drawStroke);

socket.on('connect',()=>{
    console.log("Connected with ID:",socket.id);
})

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
    if(!drawing) return;

    const data = {
        prevX: prev.x,
        prevY: prev.y,
        x: e.offsetX,
        y: e.offsetY,
        color: '#000000',
        width: 3,
        userId: socket.id
    }

    drawStroke(data);
    socket.emit('draw',data);
    prev = {x:data.x,y:data.y};
})

canvas.addEventListener('mouseup',()=> drawing = false);
canvas.addEventListener('mouseleave',()=>drawing = false);