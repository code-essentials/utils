interface AsyncVariableResultBase<Type> {
    readonly type: Type
}

interface AsyncVariableResultResolved<T> extends AsyncVariableResultBase<"resolved"> {
    readonly value: T
}

interface AsyncVariableResultRejected extends AsyncVariableResultBase<"rejected"> {
    readonly error: any
}

type AsyncVariableResult<T> =
    | AsyncVariableResultResolved<T>
    | AsyncVariableResultRejected

export class AsyncVariable<T> implements PromiseLike<T> {
    #result: AsyncVariableResult<T> | undefined
    #result_res!: (res: AsyncVariableResult<T>) => void
    #result_p!: Promise<AsyncVariableResult<T>>
    readonly #initialization: Promise<void>

    get value(): T {
        if (!this.#result)
            throw new Error('incomplete')

        if (this.#result.type === "rejected")
            throw this.#result.error

        return this.#result.value
    }

    set value(value) {
        this.set(value)
    }

    get error() {
        if (!this.#result)
            throw new Error('incomplete')

        if (this.#result.type === "resolved")
            throw new Error(this.#result.type)

        return this.#result.error
    }

    set error(error) {
        this.reject(error)
    }

    get complete() {
        return this.#result !== undefined
    }

    constructor() {
        this.#initialization = new Promise(initialized =>
            // prevents unhandled rejection
            this.#result_p = new Promise(res => {
                this.#result_res = res
                initialized()
            })
        )
    }

    async init() {
        await this.#initialization
    }

    async read() {
        await this.#initialization
        await this.#result_p
        return this.value
    }

    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): PromiseLike<TResult1 | TResult2> {
        return this.read().then(onfulfilled, onrejected)
    }

    async #complete(throw_if_set = true) {
        await this.#initialization
        if (this.complete) {
            if (throw_if_set)
                throw new Error('already set')
            else
                return false
        }

        return true
    }

    async set(value: T, throw_if_set = true) {
        if (await this.#complete(throw_if_set)) {
            this.#result_res(this.#result = {
                type: "resolved",
                value
            })
        }
    }

    async reject(error: unknown, throw_if_set = true) {
        if (await this.#complete(throw_if_set)) {
            this.#result_res(this.#result = {
                type: "rejected",
                error
            })
        }
    }

    static performCallback<R = void>(fn: (cb: (err?: unknown, res?: R) => void) => void): AsyncVariable<R> {
        const av = new AsyncVariable<R>()

        fn(async (err, res) => {
            if (err)
                await av.error(err)
            else
                await av.set(<R>res)
        })

        return av
    }

    async writeResult(task: PromiseLike<T>) {
        try {
            await this.set(await task)
        }
        catch (error) {
            await this.reject(error)
        }
    }

    perform(fn: () => PromiseLike<T>): this {
        this.writeResult(fn())

        return this
    }

    timeout(milliseconds: number): this {
        AsyncVariable.wait(milliseconds).then(() => {
            if (!this.complete)
                this.reject("timeout")
        })

        return this
    }

    static perform<T>(fn: () => Promise<T>): AsyncVariable<T> {
        return new AsyncVariable<T>().perform(fn)
    }

    static wait(milliseconds: number) {
        const res = new AsyncVariable<void>()
        setTimeout(() => res.set(), milliseconds)
        return res
    }
}
