interface AsyncVariableResultBase<Type> {
    readonly type: Type
}

interface AsyncVariableResultResolved<T> extends AsyncVariableResultBase<"resolved"> {
    readonly value: T
}

interface AsyncVariableResultRejected extends AsyncVariableResultBase<"rejected"> {
    readonly error: unknown
}

type AsyncVariableResult<T> =
    | AsyncVariableResultResolved<T>
    | AsyncVariableResultRejected

export class AsyncVariable<T> implements PromiseLike<T> {
    #result: AsyncVariableResult<T> | undefined
    #result_res: (res: AsyncVariableResult<T>) => void
    #result_p: Promise<AsyncVariableResult<T>>

    static readonly ERR_NOT_RESOLVED = "async variable not resolved or rejected"

    get value(): T {
        if (!this.#result)
            throw new Error(AsyncVariable.ERR_NOT_RESOLVED)

        if (this.#result.type === "rejected")
            throw this.#result.error

        return this.#result.value
    }

    set value(value) {
        void this.set(value)
    }

    get error() {
        if (!this.#result)
            throw new Error('incomplete')

        if (this.#result.type === "resolved")
            throw new Error(this.#result.type)

        return this.#result.error
    }

    set error(error) {
        void this.reject(error)
    }

    get complete() {
        return this.#result !== undefined
    }

    constructor() {
        const { resolve, promise } = Promise.withResolvers<AsyncVariableResult<T>>()

        this.#result_p = promise
        this.#result_res = (res => resolve(this.#result = res))
    }

    async read() {
        await this.#result_p
        return this.value
    }

    then<TResult1 = T, TResult2 = never>(
        onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): AsyncVariable<TResult1 | TResult2> {
        return AsyncVariable.perform(() => this.read().then(onfulfilled, onrejected))
    }

    #complete(throw_if_set = true) {
        if (this.complete) {
            if (throw_if_set)
                throw new Error('already set')
            else
                return false
        }

        return true
    }

    set(value: T, throw_if_set = true) {
        if (this.#complete(throw_if_set)) {
            this.#result_res(this.#result = {
                type: "resolved",
                value
            })
        }
    }

    reject(error: unknown, throw_if_set = true) {
        if (this.#complete(throw_if_set)) {
            this.#result_res(this.#result = {
                type: "rejected",
                error
            })
        }
    }

    static performCallback<R = void>(fn: (cb: (err?: unknown, res?: R) => void) => void): AsyncVariable<R> {
        const av = new AsyncVariable<R>()

        fn((err, res) => {
            if (err !== undefined)
                void av.reject(err)
            else
                void av.set(<R>res)
        })

        return av
    }

    async writeResult(task: PromiseLike<T>) {
        try {
            this.set(await task)
        }
        catch (error) {
            this.reject(error)
        }
    }

    perform(fn: () => PromiseLike<T>): this {
        void this.writeResult(fn())

        return this
    }

    timeout(milliseconds: number): this {
        AsyncVariable.wait(milliseconds).then(() => {
            if (!this.complete)
                void this.reject("timeout")
        })

        return this
    }

    static perform<T>(fn: () => Promise<T>): AsyncVariable<T> {
        return new AsyncVariable<T>().perform(fn)
    }

    static wait(milliseconds: number) {
        const res = new AsyncVariable<void>()
        setTimeout(() => void res.set(), milliseconds)
        return res
    }
}
