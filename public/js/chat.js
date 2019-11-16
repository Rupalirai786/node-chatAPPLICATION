const socket = io()



const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
//qs = query string
//const {username,room} = QS.parse(location.search , {ignoreQueryPrefix : true})
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })



socket.on('message', (message) => {
    console.log(message)
    const HTML = Mustache.render(messageTemplate , {
        username : message.username,
        message : message.text,
        createdAt :moment(message.createdAt).format('ddd,D MMM,h:mmA')
    })
    $messages.insertAdjacentHTML('beforeend',HTML)
})

socket.on('locationMessage' , (message) =>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate , {
       username : message.username,
       url : message.url,
       createdAt : moment(message.createdAt).format('ddd,D MMM,h:mmA')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('roomData',({users,room}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    console.log(users)
    document.querySelector('#sidebar').innerHTML = html

})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
   
   $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message , (error)=>{
       $messageFormButton.removeAttribute('disabled')
       $messageFormInput.value = ''
       $messageFormInput.focus() //to move cursor in the starting of input box

        if(error){
        return console.log(error)
        } 
        console.log('message delivered!')   
    })
})

document.querySelector('#send-location').addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('geolocation is not supported by browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) =>{
       
        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        } , () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared!')
        })
    })
})

//socket.emit('join',{username,room})
socket.emit('join', {username,room},(error)=>{
    if (error) {
        alert(error)
        location.href = '/'
    }


})

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          

//socket.on('countupdated' ,(count) =>{
//    console.log('its the client side babes' ,count)
//})

//document.querySelector('#increment').addEventListener('click', () => {
//    console.log('Clicked')
//    socket.emit('increment')
    
//})
//second argument and further ones in emit function present in index.js are referred
// as parameters in client side receiver option. this name can vary but the thing that 
//is necessary is the order of writing the paramers which are passed.

