const socket = io()

socket.on('connect',()=>{
    console.log("Connected with ID:",socket.id);
})

socket.on('user-count',(count)=>{
    document.getElementById('count').textContent = count;
})

socket.on('disconnect',()=>{
    console.log('Disconnected');
})