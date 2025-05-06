document.querySelector("#profileBtn").addEventListener("click", displayOptions);
document.querySelector("#suggestionBtn").addEventListener("click", suggestPassword);
document.querySelector("#lengthCheck").addEventListener("submit", validateLength);
alert("JS active");

function validateLength(e){
    console.log("validation function fired");
    let password = document.querySelector("input[name=Password]").value;
    alert(password);
    let errorMessage = document.querySelector("#errorMessage")
    if(password.length < 8){
        e.preventDefault();
        errorMessage.hidden = false;
        errorMessage.innerHTML = '<div>Password must be at least 8 characters long!</div>';
        errorMessage.style.color = "red";
        console.log("Password too short");
    } else {
        errorMessage.hidden = true;
    }
}

function getUsernameFromHeading() {
    let welcomeHeading = document.querySelector("h2");
    if (welcomeHeading) {
      let usernameText = welcomeHeading.textContent.trim();
      return usernameText.replace("Welcome ", "").replace("!", "");
    }
    return ""; 
  }
  

function displayOptions(){
    let updateUsername = document.querySelector("#updateUsername");
    let updatePassword = document.querySelector("#updatePassword");
    let suggestionBtn = document.querySelector("#suggestionBtn");
    let suggestedPassword = document.querySelector("#suggestedPassword");
    let currentUsername = getUsernameFromHeading();

    if(updateUsername.querySelector("input")) {
        updateUsername.innerHTML = "";
        updatePassword.innerHTML = "";
        suggestionBtn.style.display = "none";
        suggestedPassword.innerHTML = "";
    }else{
        updateUsername.innerHTML = `Username: <input type="text" name="Username" value="${currentUsername}">`;
        updatePassword.innerHTML = `Password: <input type="password" name="Password">`;
        suggestionBtn.style.display = "inline-block";
    }
}

async function suggestPassword(){
    let displaySuggestion = document.querySelector("#suggestedPassword");
    displaySuggestion.innerHTML = "";
    let url = `https://csumb.space/api/suggestedPassword.php?length=8`;
    let response = await fetch(url);
    let data = await response.json();
    let password = data.password;
    displaySuggestion.innerHTML = "Suggested password = " + password;
}