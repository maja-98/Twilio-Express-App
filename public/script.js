const result =  JSON.parse(localStorage.getItem("TWILIO_APP_MESSAGE_XREF")) ?? []
updateUI(result)

function handleFileLoad(event) {
    const result = (event.target.result.split('\n').slice(1).map(val => {
        const phone= val.split(',')[0]
        const message = val.split(',')[1]?.replace('\r','')
        return {phone,message}
    })).filter(val => val.phone!=='' && val.message)
    
    localStorage.setItem("TWILIO_APP_MESSAGE_XREF",JSON.stringify(result))
    location.reload()


}
function updateUI(result){
    if (!result.length){
        document.getElementById('message-details').innerHTML= `<p>No Lines to Sent</p>`
    }
    else{
        document.getElementById('message-details').innerHTML=`<div class='flex-display'><h4 class='phone-input'>Phone</h4>
        <h4 class='message-input'>Message</h4></div>`
        + result?.map((val,ind)=>{
            const str = (val.phone.match('[+][1234567890]{11,13}')) 
            let errClass="err-input";
            let errTitle ="Enter correct Phone Number (eg:+1232323123)"
            if (str){
                if(str[0] ===val.phone){
                    errClass = "valid-input";
                    errTitle = undefined
                }
            }
            return `<div class="message-input-container">
                <input ' type="phone" title="${errTitle??''}" class="${errClass} phone-input" value="${val.phone}" id='phone_${ind}'/>
                <input class='message-input'  value="${val.message}" id='message_${ind}'/>
                <button  onclick="handleRemove('phone_${ind}')">Remove</button>
            </div>`
        }).join('')+`<div class="column-flex "><button class="send-message-btn"  onclick="handlesendMessages()">Send Messages</button></div>`
    }

}
function handleRemove(element){
    const phone = document.getElementById(element).value
    const inputArrays = ( Array.from(document.getElementsByClassName('message-input-container')).map(r=>Array.from(r.children)))
    const result = inputArrays.map(val => { return {'phone':val[0].value,'message':val[1].value}})
    updateUI(result.filter(val=> val.phone!==phone))
    localStorage.setItem("TWILIO_APP_MESSAGE_XREF",JSON.stringify(result.filter(val=> val.phone!==phone)))
}
function validatePhoneNumbers(){
    const inputArrays = ( Array.from(document.getElementsByClassName('message-input-container')).map(r=>Array.from(r.children)))
    const body = inputArrays.map(val => { return {'phone':val[0].value,'message':val[1].value}})
    const errorValue = body.find(val =>{
        const str = (val.phone.match('[+][1234567890]{11,13}')) 
        if (str){
            return !str[0]===val.phone
        }
        return true
    } )    
    if (errorValue!==undefined){
        updateUI(body)
        return false
    }
    return true
}
function toggleOverlay(){
    const overlay = document.getElementById('overlay')
    if (Array.from(overlay.classList).includes('show')){
        overlay.classList.remove('show')
        overlay.classList.add('hide')
    }
    else{
        overlay.classList.add('show')
        overlay.classList.remove('hide')        
    }
}
function setOverlayMessage(heading,message){
    document.getElementById('overlay-head').textContent = heading
    document.getElementById('overlay-message').textContent = message
    
}
async function handlesendMessages(){
    const inputArrays = ( Array.from(document.getElementsByClassName('message-input-container')).map(r=>Array.from(r.children)))
    const body = inputArrays.map(val => { return {'phone':val[0].value,'message':val[1].value}})
    if (!validatePhoneNumbers()){
        setOverlayMessage('Invalid Phone number','Make sure that phone number is Valid and correct format with country code')
        toggleOverlay()
        return
    }
    localStorage.setItem("TWILIO_APP_MESSAGE_XREF",JSON.stringify(body))
    const filteredBody = body.filter(val => {
       const str = (val.phone.match('[+][1234567890]{11,13}')) 

       if (str){
            return str[0] ===val.phone
       }
       return false
       
    })
    await fetch("/send-messages", { method: "POST", 
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(filteredBody) })
            .then(res => res.json())
            .then(res => {
                console.log(res)
            })
            .catch(err => console.error(err))
}
document.getElementById('file-upload').addEventListener('change',(event)=>{
    const reader = new FileReader()
    reader.onload = handleFileLoad;
    reader.readAsText(event.target.files[0])
}
)
