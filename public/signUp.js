document.querySelector("#signUpForm").addEventListener("submit", validatePassword);
function validatePassword(e){
    let username = document.querySelector("input[name=username]").value;
    let password = document.querySelector("input[name=password]").value;
    let secondPassword = document.querySelector("input[name=passwordConfirm]").value;
    let errorMessage = document.querySelector("#errorMessage")
    if (username.length < 3){
        e.preventDefault();
        errorMessage.hidden = false;
        errorMessage.innerHTML = '<div>Username must be at least 3 characters!</div>';
    } else if (password.length < 8) {
        e.preventDefault();
        errorMessage.hidden = false;
        errorMessage.innerHTML = '<div>Password must be at least 8 characters!</div>';
    } else if(password != secondPassword){
        e.preventDefault();
        errorMessage.hidden = false;
        errorMessage.innerHTML = '<div>Passwords must match!</div>';
    } else {
        errorMessage.hidden = true;
    }
}