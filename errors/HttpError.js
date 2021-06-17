class HttpError extends Error {
    constructor(message, errorCode){
        super(message); // add a message property to instance
        this.code = errorCode; // add code property to instance
    }
}

module.exports = HttpError;