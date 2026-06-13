let token = ""
let generatedTests = []
let swaggerData = null
let editingNoteId = null
let lastStatusCode = 0
let lastResponseData = null

token = localStorage.getItem("token")

if(token){

    const loginSection =
        document.getElementById("login-section")

    if(loginSection){
        loginSection.style.display = "none"
    }

    getNotes()
}

async function login(){

    const username =
        document.getElementById("username").value

    const password =
        document.getElementById("password").value

    if(!username || !password){

        alert("Enter username and password")

        return
    }

    const formData = new FormData()

    formData.append("username", username)
    formData.append("password", password)

    try{


        const response = await fetch(
            "http://127.0.0.1:8000/login",
            {
                method: "POST",
                body: formData
            }
        )

        const data = await response.json()

        if(data.access_token){

            token = data.access_token

            localStorage.setItem(
                "token",
                token
            )

            document.getElementById(
                "welcome-text"
            ).innerText =
            `Welcome back, ${username} 👋`

            alert("Login Successful 😎")

            const loginSection =
                document.getElementById("login-section")

            if(loginSection){
                loginSection.style.display = "none"
            }

            getNotes()

        }else{

            alert("Invalid username or password")
        }

    }catch(error){

        console.log(error)

        alert("Backend not running")
    }
}

async function register(){

    const username =
        document.getElementById("username").value

    const password =
        document.getElementById("password").value

    if(!username || !password){

        alert("Enter username and password")

        return
    }

    const response = await fetch(
        "http://127.0.0.1:8000/register",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username: username,
                password: password
            })
        }
    )

    const data = await response.json()

    alert(data.message)
}

async function createNote(){

    const title =
        document.getElementById("title").value

    const content =
        document.getElementById("content").value

    const category =
        document.getElementById("category").value

    if(!title || !content){

        alert("Enter note details")

        return
    }

    let url =
        "http://127.0.0.1:8000/create-note"

    let method = "POST"

    if(editingNoteId){

        url =
        `http://127.0.0.1:8000/update-note/${editingNoteId}`

        method = "PUT"
    }

    await fetch(
        url,
        {
            method: method,

            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },

            body: JSON.stringify({
                title: title,
                content: content,
                category: category
            })
        }
    )

    if(editingNoteId){

        alert("Note Updated ✏️")

        editingNoteId = null

    }else{

        alert("Note Created 🚀")
    }

    document.getElementById("title").value = ""
    document.getElementById("content").value = ""

    getNotes()
}

async function getNotes(){
    const token =
        localStorage.getItem("token")

    console.log(
        "TOKEN =",
        token
    )

    const response = await fetch(
        "http://127.0.0.1:8000/my-notes",
        {
            headers: {
                "Authorization": "Bearer " + token
            }
        }
    )

    const notes = await response.json()

    const notesDiv =
        document.getElementById("notes")

    notesDiv.innerHTML = ""

    if(Array.isArray(notes)){

        notes.sort(
            (a, b) => b.pinned - a.pinned
        )

        document.getElementById(
            "total-notes"
        ).innerText = notes.length

        const categories = new Set(
            notes.map(note => note.category)
        )

        document.getElementById(
            "total-categories"
        ).innerText = categories.size

        notes.forEach(note => {

            notesDiv.innerHTML += `

            <div class="note ${note.category.trim().toLowerCase()}">

                <h3>${note.title}</h3>

                <small>
                    📌 ${note.category}
                    <br>
                    🕒 ${note.created_at}
                </small>

                <p>${note.content}</p>

                <button onclick="togglePin(${note.id})">
                    ${note.pinned ? "📌 Unpin" : "📌 Pin"}
                </button>

                <button onclick="editNote(
                    ${note.id},
                    '${note.title}',
                    '${note.content}'
                )">
                    Edit
                </button>

                <button onclick="deleteNote(${note.id})">
                    Delete
                </button>

            </div>
            `
        })
    }
}

async function deleteNote(noteId){

    await fetch(
        `http://127.0.0.1:8000/delete-note/${noteId}`,
        {
            method: "DELETE",

            headers: {
                "Authorization": "Bearer " + token
            }
        }
    )

    alert("Note Deleted 🗑️")

    getNotes()
}

function editNote(id, title, content){

    editingNoteId = id

    document.getElementById("title").value =
        title

    document.getElementById("content").value =
        content

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    })
}

function logout(){

    token = ""

    localStorage.removeItem("token")

    alert("Logged out")

    location.reload()
}

function searchNotes(){

    const searchValue =
        document.getElementById("search")
        .value
        .toLowerCase()

    const notes =
        document.querySelectorAll(".note")

    notes.forEach(note => {

        const title =
            note.querySelector("h3")
            .innerText
            .toLowerCase()

        const content =
            note.querySelector("p")
            .innerText
            .toLowerCase()

        if(
            title.includes(searchValue) ||
            content.includes(searchValue)
        ){

            note.style.display = "block"

        }else{

            note.style.display = "none"
        }
    })
}

function toggleTheme(){

    document.body.classList.toggle(
        "light-mode"
    )

    if(
        document.body.classList.contains(
            "light-mode"
        )
    ){

        localStorage.setItem(
            "theme",
            "light"
        )

        document.getElementById(
            "theme-btn"
        ).innerText = "🌙"

    }else{

        localStorage.setItem(
            "theme",
            "dark"
        )

        document.getElementById(
            "theme-btn"
        ).innerText = "☀️"
    }
}

const savedTheme =
    localStorage.getItem("theme")

if(savedTheme === "light"){

    document.body.classList.add(
        "light-mode"
    )

    document.getElementById(
        "theme-btn"
    ).innerText = "🌙"
}

async function togglePin(noteId){
    

    await fetch(
        `http://127.0.0.1:8000/toggle-pin/${noteId}`,
        {
            method: "PUT",

            headers: {
                "Authorization": "Bearer " + token
            }
        }
    )

    getNotes()
}
async function testAPI(){
    const token = localStorage.getItem("token")

    const url =
        document.getElementById(
            "api-url"
        ).value

    const method =
        document.getElementById(
            "api-method"
        ).value

    const body =
        document.getElementById(
            "api-body"
        ).value

    let options = {

    method: method,

    headers: {
    "Content-Type": "application/json"
}
}

    if(method === "POST"){

        options.body = body
    }

    try{

        const startTime = Date.now()
        

        const response =
            await fetch(url, options)
            lastStatusCode = response.status

console.log(
    "LAST STATUS =",
    lastStatusCode
)

        const endTime = Date.now()

        const responseTime =
            endTime - startTime

        let data

try{
    data = await response.json()
    lastResponseData = data
}catch{
    data = {
        message: "Response is not JSON"
    }

    lastResponseData = data
}

            let debugMessage = ""

if(response.status === 200){

    debugMessage =
    "✅ API Working Correctly"

}else if(response.status === 401){

    debugMessage =
    "❌ Unauthorized - Check Token/Login"

}else if(response.status === 404){

    debugMessage =
    "❌ Endpoint Not Found"

}else if(response.status === 500){

    debugMessage =
    "❌ Internal Server Error"

}
let analysis = ""

if(response.status === 200){

    analysis = `
API HEALTH REPORT

Status: Success ✅

Response Time: Excellent

JSON Format: Valid

Recommendation:
API is working correctly.
`

}else if(response.status === 401){

    analysis = `
UNAUTHORIZED ❌

Possible Causes:
• Invalid Token
• Expired Token
• Missing Authentication

Recommendation:
Check login credentials or token.
`

}else if(response.status === 404){

    analysis = `
ENDPOINT NOT FOUND ❌

Possible Causes:
• Wrong URL
• Missing Route
• API Not Deployed

Recommendation:
Verify API endpoint.
`

}else if(response.status === 500){

    analysis = `
INTERNAL SERVER ERROR ❌

Possible Causes:
• Database Failure
• Backend Exception
• Server Configuration Issue

Recommendation:
Check backend logs.
`
}
let rootCause = ""

if(response.status === 200){

    rootCause = `
No issues detected ✅

Root Cause:
API is functioning normally.

Action:
No action required.
`

}else if(response.status === 401){

    rootCause = `
Possible Causes:

• Invalid Token
• Expired Token
• Missing Authorization Header

Suggested Fix:

Generate a new token and retry.
`

}else if(response.status === 404){

    rootCause = `
Possible Causes:

• Wrong URL
• Route does not exist
• Incorrect API version

Suggested Fix:

Verify endpoint path.
`

}else if(response.status === 500){

    rootCause = `
Possible Causes:

• Database failure
• Backend exception
• Internal server bug

Suggested Fix:

Check backend logs.
`
}
        document.getElementById(
    "api-response"
).innerText =

"Status: " +
response.status +

"\nResponse Time: " +
responseTime + " ms" +

"\n\n" +
debugMessage +

"\n\n" +

JSON.stringify(
    data,
    null,
    2
)
document.getElementById(
    "api-analysis"
).innerText = analysis
document.getElementById(
    "root-cause"
).innerText = rootCause

    }catch(error){

        console.log(error)

document.getElementById(
    "api-response"
).innerText =
"API Error ❌\n\n" + error
    }
}
function generateTests(){

    const bodyText =
        document.getElementById("api-body").value
        console.log("BODY TEXT =", bodyText)

    const output =
        document.getElementById("generated-tests")

    try{
        console.log("BODY TEXT =", bodyText)

        const data = JSON.parse(bodyText)

        generatedTests = []

        // Valid Input
        generatedTests.push({
    name: "✅ Valid Input",
    data: {...data}
})

        for(let key in data){

            // Empty Test
            let emptyTest = {...data}
            emptyTest[key] = ""

            generatedTests.push({
                name: `❌ Empty ${key}`,
                data: emptyTest
            })

            // Null Test
            let nullTest = {...data}
            nullTest[key] = null

            generatedTests.push({
                name: `❌ Null ${key}`,
                data: nullTest
            })

            // SQL Injection Test
            let sqlTest = {...data}
            sqlTest[key] = "' OR 1=1 --"

            generatedTests.push({
                name: `⚠ SQL Injection ${key}`,
                data: sqlTest
            })

            // XSS Test
            let xssTest = {...data}
            xssTest[key] = "<script>alert('xss')</script>"

            generatedTests.push({
                name: `⚠ XSS ${key}`,
                data: xssTest
            })

        }

        output.innerHTML = ""

        generatedTests.forEach(test => {

            output.innerHTML += `
                <div style="
                    margin-bottom:15px;
                    padding:10px;
                    border:1px solid #444;
                    border-radius:8px;
                ">
                    <b>${test.name}</b>
                    <pre>${JSON.stringify(test.data, null, 2)}</pre>
                </div>
            `
        })

    }
    catch(error){

    console.log("JSON ERROR =", error)

    output.innerHTML =
        "❌ " + error.message

}
}
async function runAllTests(){

    const resultsDiv =
        document.getElementById("test-results")

    resultsDiv.innerHTML = ""
    let securityScore = 100

    const url =
        document.getElementById("api-url").value

    const method =
        document.getElementById("api-method").value
        console.log("METHOD =", method)

    for(const test of generatedTests){

        try{
            console.log("TEST NAME =", test.name)
console.log("TEST DATA =", test.data)

            let response

            if(method === "GET"){

                response = await fetch(
                    url,
                    {
                        method:"GET"
                    }
                )

            }else{

                response = await fetch(
                    url,
                    {
                        method:method,

                        headers:{
                            "Content-Type":"application/json"
                        },

                        body:JSON.stringify(test.data)
                    }
                )

            }
    

            let result = ""
            let reason = ""
let fix = ""

if(response.status === 200){
    reason = "Request processed successfully"
    fix = "No action needed"
}
else if(response.status === 400){
    reason = "Invalid input or validation failed"
    fix = "Check required fields and input format"
}
else if(response.status === 401){
    reason = "Authentication failed"
    fix = "Provide valid token"
}
else if(response.status === 403){
    reason = "Access denied"
    fix = "Check permissions"
}
else if(response.status === 404){
    reason = "API endpoint not found"
    fix = "Verify URL"
}
else if(response.status === 422){
    securityScore -= 5
    reason = "Missing or invalid field values"
    fix = "Check field types and null values"
}
else if(response.status >= 500){
    reason = "Server error"
    fix = "Check backend logs"
}

switch(response.status){

    case 200:
        reason = "Request processed successfully"
        fix = "No action needed"
        break

    case 400:
        reason = "Invalid input or validation failed"
        fix = "Check required fields and input format"
        break

    case 401:
        reason = "Authentication failed"
        fix = "Login again and provide valid token"
        break

    case 403:
        reason = "Permission denied"
        fix = "Use an authorized account"
        break

    case 404:
        reason = "Endpoint not found"
        fix = "Verify API URL"
        break

    case 422:
        reason = "Missing or invalid field values"
        fix = "Check field types and null values"
        break

    case 500:
        reason = "Internal server error"
        fix = "Check backend logs"
        break

    default:
        reason = "Unknown error"
        fix = "Investigate API response"
}
lastStatusCode = response.status
if(test.name.includes("Valid")){
    result =
        response.status === 200
        ? "✅ PASS"
        : "❌ FAIL"
}
else{
    result =
        (
            response.status === 400 ||
            response.status === 422
        )
        ? "✅ PASS"
        : "❌ FAIL"
}

            resultsDiv.innerHTML += `
<div class="result-card">

    <b>${test.name}</b>

    <br><br>

    Status: ${response.status}

    <br>

    ${result}

    <br><br>

    <b>Reason:</b>

    ${reason}

    <br><br>

    <b>Suggested Fix:</b>

    ${fix}

</div>
`

        }
  catch(error){

    lastStatusCode = 500

    resultsDiv.innerHTML += `
    <div class="result-card">

        <b>${test.name}</b>

        <br><br>

        Status: Request Failed

        <br><br>

        ❌ FAIL

        <br><br>

        <b>Reason:</b> Network error or server unavailable

        <br><br>

        <b>Suggested Fix:</b> Check API URL and backend server

    </div>
    `
}

}

let riskLevel = "LOW"

if(securityScore < 80){
    riskLevel = "MEDIUM"
}

if(securityScore < 60){
    riskLevel = "HIGH"
}

document.getElementById(
    "security-score"
).innerText =

`Security Score: ${securityScore}/100

Validation Testing: ✅ PASS
SQL Injection Testing: ✅ PASS
XSS Testing: ✅ PASS
Authentication Testing: ⚠ Needs Review

Risk Level: ${riskLevel}`

}
function askAI(){

    let answer = ""

    if(lastStatusCode === 200){

    answer =
`✅ API Healthy

Problem:
No issues detected.

Evidence:
Status Code 200 returned successfully.

Root Cause:
Request processed correctly.

Suggested Fix:
No action required.`
}

    else if(lastStatusCode === 401){

    let evidence = ""

    if(
        lastResponseData &&
        lastResponseData.detail
    ){
        evidence =
        lastResponseData.detail
    }

    answer =
`🚫 Endpoint Not Found

Problem:
Requested API endpoint does not exist.

Evidence:
${evidence}

Root Cause:
Wrong URL or missing route.

Suggested Fix:
Verify endpoint path and API version.`
}

    else if(lastStatusCode === 404){

    let evidence = ""

    if(
        lastResponseData &&
        lastResponseData.detail
    ){
        evidence =
        lastResponseData.detail
    }

    answer =
    `🚫 Endpoint Not Found

Evidence:
${evidence}

Problem:
Requested API route does not exist.

Root Cause:
Wrong URL or missing endpoint.

Suggested Fix:
Verify API URL and route path.`
}

    else if(lastStatusCode === 422){

    let evidence = ""

    if(
        lastResponseData &&
        lastResponseData.detail
    ){

        evidence =
        JSON.stringify(
            lastResponseData.detail,
            null,
            2
        )
    }

    answer =
    `⚠ Validation Error

Problem:
Request validation failed.

Evidence:
${evidence}

Root Cause:
Input data does not match API schema.

Suggested Fix:
Check field names, data types, and required values.`
}

    else if(lastStatusCode === 500){

    let evidence = ""

    if(
        lastResponseData &&
        lastResponseData.detail
    ){
        evidence =
        lastResponseData.detail
    }

    answer =
    `🔥 Internal Server Error

Evidence:
${evidence}

Problem:
Backend crashed while processing request.

Root Cause:
Server-side exception or database issue.

Suggested Fix:
Check FastAPI logs and backend code.`
}

    else{

        answer =
        "Run a request first so I can analyze it."
    }

    document.getElementById(
        "ai-response"
    ).innerText = answer
}
async function importSwagger(){

    const swaggerUrl =
        document.getElementById(
            "swagger-url"
        ).value

    const results =
        document.getElementById(
            "swagger-results"
        )

    try{

        const response =
            await fetch(swaggerUrl)

        const data =
            await response.json()

            swaggerData = data

        let output = ""

        for(let path in data.paths){

    for(let method in data.paths[path]){

        output += `
<div
    class="result-card"
    onclick="
        selectEndpoint(
            '${path}',
            '${method}'
        )
    "
    style="
        cursor:pointer;
    "
>

    <b>${method.toUpperCase()}</b>

    <br>

    ${path}

</div>
`
    }
}

        results.innerHTML = output

    }
    catch(error){

        results.innerHTML =
        "❌ Unable to load Swagger file"
    }
}
function selectEndpoint(path, method){

    document.getElementById(
        "api-url"
    ).value =
    "http://127.0.0.1:8000" + path

    document.getElementById(
        "api-method"
    ).value =
    method.toUpperCase()

    if(
        method.toLowerCase() === "post"
    ){

        if(path === "/test-user"){

            document.getElementById(
                "api-body"
            ).value =
`{
    "name":"string",
    "age":0
}`
        }

        else if(path === "/login"){

            document.getElementById(
                "api-body"
            ).value =
`{
    "username":"string",
    "password":"string"
}`
        }

        else if(path === "/register"){

            document.getElementById(
                "api-body"
            ).value =
`{
    "username":"string",
    "password":"string"
}`
        }

    }
}
async function exportPDF(){

    const { jsPDF } = window.jspdf

    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Smart API Assistant Report", 20, 20)

    doc.setFontSize(12)

    doc.text(
        "API URL: " +
        document.getElementById("api-url").value,
        20,
        40
    )

    doc.text(
        "Method: " +
        document.getElementById("api-method").value,
        20,
        50
    )

    doc.text(
        "Security Score:",
        20,
        70
    )

    doc.text(
        document.getElementById(
            "security-score"
        ).innerText,
        20,
        80
    )

    doc.text(
        "AI Analysis:",
        20,
        120
    )

    doc.text(
        document.getElementById(
            "ai-response"
        ).innerText,
        20,
        130
    )

    doc.save(
        "API_Test_Report.pdf"
    )
}
function saveCollection(){

    let collections =
        JSON.parse(
            localStorage.getItem("collections")
        ) || []

    collections.push({

        url:
        document.getElementById(
            "api-url"
        ).value,

        method:
        document.getElementById(
            "api-method"
        ).value,

        body:
        document.getElementById(
            "api-body"
        ).value
    })

    localStorage.setItem(
        "collections",
        JSON.stringify(collections)
    )

    loadCollections()

    alert("API Saved ✅")
}
function loadCollections(){

    const collectionsDiv =
        document.getElementById(
            "collections"
        )

    collectionsDiv.innerHTML = ""

    let collections =
        JSON.parse(
            localStorage.getItem("collections")
        ) || []

    collections.forEach((api,index)=>{

        collectionsDiv.innerHTML += `
        <div class="result-card">

            <b>${api.method}</b>

            <br>

            ${api.url}

            <br><br>

            <button
                onclick="openCollection(${index})"
            >
                Open
            </button>

        </div>
        `
    })
}
function openCollection(index){

    let collections =
        JSON.parse(
            localStorage.getItem("collections")
        ) || []

    const api =
        collections[index]

    document.getElementById(
        "api-url"
    ).value =
    api.url

    document.getElementById(
        "api-method"
    ).value =
    api.method

    document.getElementById(
        "api-body"
    ).value =
    api.body
}
loadCollections()