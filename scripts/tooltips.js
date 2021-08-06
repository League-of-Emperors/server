/* 
    (c) Maciej Dębowski Tooltips.js
    2021-today
    All rights reserved
*/

(function() {

    function createTooltip(x, y, text, element) {
        const tooltip = document.createElement("div")
        document.body.appendChild(tooltip)

        tooltip.classList.add("tooltip")
        tooltip.style.top = `${y + (element.style.height + 10) / 2}px`
        tooltip.style.left = `${x - 150}px`
        tooltip.style.background = element.dataset.tooltipbackground

        tooltip.innerText = text
    }

    document.addEventListener("DOMContentLoaded", function() {
        const tooltips = document.querySelectorAll("[data-tooltip]")

        tooltips.forEach(tooltip => {
            tooltip.addEventListener("mouseover", function() {
                const metrics = tooltip.getBoundingClientRect()
                createTooltip(metrics.x, metrics.y, tooltip.dataset.tooltip, tooltip)
            })

            tooltip.addEventListener("mouseout", function() {
                document.querySelectorAll(".tooltip").forEach(div => div.remove())
            })
        })
    })
})()