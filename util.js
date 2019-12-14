
export function assert(condition, message) {
    if (!condition) {
        console.log(message)
        debugger
        // throw message
    }
}

export function arraysEqual(a1,a2) {
    return JSON.stringify(a1)==JSON.stringify(a2);
}
