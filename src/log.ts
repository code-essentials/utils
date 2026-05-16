export class Log implements Disposable {
    constructor(readonly msg: string) {
        console.log(msg)
    }

    [Symbol.dispose]() {
        console.log(`${this.msg} complete`)
    }
}

export function log(msg: string) {
    return new Log(msg)
}
