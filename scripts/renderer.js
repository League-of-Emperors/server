class Renderer {

    /* Rendering cube */
    render (
        x, y,
        size,
        color
    ) {
        this.ctx.beginPath()
        this.ctx.arc(x,y,size, 0, Math.PI * 2)
        this.ctx.fillStyle = color
        this.ctx.fill()
    }

    renderCircleBorder(
        x,y,
        size,
        color 
    ) {
        this.ctx.beginPath()
        this.ctx.arc(x,y,size, 0, Math.PI * 2)
        this.ctx.fillStyle = "transparent"
        this.ctx.fill()
        this.ctx.lineWidth = 3.5;
        this.ctx.strokeStyle = color
        this.ctx.stroke()

    }

    renderImage(
        x,y,
        width,
        height,
        imageSource
    ) {
        const img = new Image()
        img.src = imageSource
        this.ctx.drawImage(img,x,y,width,height)
    }

    constructor(ctx) {
        this.ctx = ctx
        return this
    }
}

export default Renderer