import { AsyncVariable } from "./async-variable.js"

interface EnqueuedTask<T> {
    task: PromiseLike<T>
    completion: AsyncVariable<T>
}

export class Barrier<T = unknown> implements PromiseLike<T[]>, AsyncDisposable {
    readonly queue: EnqueuedTask<T>[] = []

    await(...asyncTasks: PromiseLike<T>[]): this {
        for (const asyncTask of asyncTasks)
            this.#run(asyncTask)

        return this
    }

    #run(task: PromiseLike<T>) {
        const completion = new AsyncVariable<T>()
        this.queue.push({ task, completion })
        void completion.writeResult(task)
    }

    run(...asyncFunctions: (() => PromiseLike<T>)[]): this {
        for (const func of asyncFunctions)
            this.#run(func())

        return this
    }

    clear(): this {
        this.queue.splice(0, this.queue.length)

        return this
    }

    async complete() {
        const result = await this
        this.clear()
        return result
    }

    async [Symbol.asyncDispose]() {
        await this.complete()
    }

    async then<TResult1 = T[], TResult2 = never>(
        onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
    ): Promise<TResult1 | TResult2> {
        try {
            const values = await Promise.all(this.queue.map(({ completion }) => completion))
            return <TResult1>await onfulfilled?.(values)
        }
        catch (reason) {
            return <TResult2>await onrejected?.(reason)
        }
    }
}
