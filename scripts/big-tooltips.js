/* 
    (c) Maciej Dębowski Big-Tooltips.js
    2021-today
    All rights reserved
*/

function appendTooltip() {
    function createTooltip(x, y, text, element) {
        const tooltip = document.createElement("div")
        document.body.appendChild(tooltip)

        tooltip.classList.add("tooltip")
        tooltip.style.background = element.dataset.tooltipbackground

        if(element.getAttribute("data-tooltip-height")) tooltip.style.height = element.getAttribute("data-tooltip-height") + "px"
        if(element.getAttribute("data-tooltip-width")) tooltip.style.width = element.getAttribute("data-tooltip-width") + "px"

        tooltip.style.top = `${y + 50}px`
        tooltip.style.left = `${x - (element.getAttribute("data-tooltip-width") / 2) + 10}px`

        tooltip.innerHTML = text
    }

    document.addEventListener("DOMContentLoaded", function() {
        const tooltips = document.querySelectorAll("[data-tooltip-big]")

        tooltips.forEach(tooltip => {
            tooltip.addEventListener("mouseover", function() {
                const metrics = tooltip.getBoundingClientRect()
                createTooltip(metrics.x, metrics.y, tooltip.getAttribute("data-tooltip-big"), tooltip)
            })

            tooltip.addEventListener("mouseout", function() {
                document.querySelectorAll(".tooltip").forEach(div => div.remove())
            })
        })
    })
}

(function() {
    appendTooltip()
})()