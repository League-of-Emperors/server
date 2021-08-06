/* Chat */
document.querySelector(".chat-btn-close")
.addEventListener("click", function() {
    document.querySelector(".chat")
    .classList.remove("active")
})

document.querySelector(".chat-open-icon-button")
.addEventListener("click", function() {
    document.querySelector(".chat")
    .classList.toggle("active")
})

/* Country manager */
document.querySelector(".contry-manager-icon-button").addEventListener("click", function() {
    document.querySelector(".country-manager")
    .classList.toggle("open")
})

document.querySelector(".country-manager-close").addEventListener("click", function() {
    document.querySelector(".country-manager")
    .classList.remove("open")
})

/* War Menu */
document.querySelector(".war-menu-icon-button").addEventListener("click", function() {
    document.querySelector(".war-menu")
    .classList.toggle("open")
})

document.querySelector(".war-menu-close").addEventListener("click", function() {
    document.querySelector(".war-menu")
    .classList.remove("open")
})

/* Buildings builder */
document.querySelector(".country-building-icon-button").addEventListener("click", function() {
    document.querySelector(".build-house")
    .classList.toggle("open")
})

document.querySelector(".country-builder-close").addEventListener("click", function() {
    document.querySelector(".build-house")
    .classList.remove("open")
})

/* Always close */
document.addEventListener("keyup", function(e) {
    if(e.which == 27) {
        document.querySelector(".chat")
        .classList.remove("active")

        document.querySelector(".country-manager")
        .classList.remove("open")

        document.querySelector(".build-house")
        .classList.remove("open")

        document.querySelector(".war-menu")
        .classList.remove("open")
    }
})

document.querySelector("canvas").addEventListener("click", function(e) {
    document.querySelector(".chat")
    .classList.remove("active")

    document.querySelector(".country-manager")
    .classList.remove("open")

    document.querySelector(".build-house")
    .classList.remove("open")

    document.querySelector(".war-menu")
    .classList.remove("open")
})

