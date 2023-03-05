const result =  JSON.parse(localStorage.getItem("TWILIO_APP_MESSAGE_XREF")) ?? []
updateUI(result)
function handleFileLoad(event) {
    const result = (event.target.result.split('\n').map(val => {
        const phone= val.split(',')[0]
        const message = val.split(',')[1]?.replace('\r','')
        return {phone,message}
    })).filter(val => val.phone!=='' && val.message)
    
    localStorage.setItem("TWILIO_APP_MESSAGE_XREF",JSON.stringify(result))
    location.reload()


}
function updateUI(result){
    console.log(result.length)
    if (!result.length){
        document.getElementById('message-details').innerHTML= `<p>No Lines to Sent</p>`
    }
    else{
        document.getElementById('message-details').innerHTML= result?.map((val,ind)=>{
            return `<div class="message-input-container">
                <input type="phone" value="${val.phone}" name='phone_${ind}'/>
                <input value="${val.message}" name='message_${ind}'/>
                <button onclick="handleRemove('${val.phone}')">Remove</button>
            </div>`
        }).join('')+`<button onclick="handlesendMessages()">Send Messages</button>`
    }

}
function handleRemove(phone){
    const result = JSON.parse(localStorage.getItem("TWILIO_APP_MESSAGE_XREF"))
    updateUI(result.filter(val=> val.phone!==phone))
    localStorage.setItem("TWILIO_APP_MESSAGE_XREF",JSON.stringify(result.filter(val=> val.phone!==phone)))
}
async function handlesendMessages(){
    const inputArrays = ( Array.from(document.getElementsByClassName('message-input-container')).map(r=>Array.from(r.children)))
    const body = inputArrays.map(val => { return {'phone':val[0].value,'message':val[1].value}})
    localStorage.setItem("TWILIO_APP_MESSAGE_XREF",JSON.stringify(body))
    const filteredBody = body.filter(val => {
       const str = (val.phone.match('[+][1234567890]{11,13}')) 

       if (str){
            return str[0] ===val.phone
       }
       return false
       
    })
    console.log(typeof(filteredBody))
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
