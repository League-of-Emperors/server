module.exports = {

    formatNumberTo09Format(number) {
        if(parseInt(number) < 10) return '0'+parseInt(number)    
        return parseInt(number)
    },

    time() {
        const date = new Date()

        const hour = this.formatNumberTo09Format(date.getHours())
        const minutes = this.formatNumberTo09Format(date.getMinutes())
        const seconds = this.formatNumberTo09Format(date.getSeconds())

        return `${hour}:${minutes}:${seconds}`
    },

    fileFormatedDateTime() {
        const date = new Date()

        const hour = this.formatNumberTo09Format(date.getHours())
        const minutes = this.formatNumberTo09Format(date.getMinutes())
        const seconds = this.formatNumberTo09Format(date.getSeconds())

        const year = this.formatNumberTo09Format(date.getFullYear())
        const month = this.formatNumberTo09Format(date.getMonth()+1)
        const day = this.formatNumberTo09Format(date.getDay()+1)

        const ts = date.getTime() // time stamp

        return `${day}.${month}.${year} ${hour}-${minutes}-${seconds}`
    }
}