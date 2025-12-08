import { AsyncVariable } from "./async-variable.js"

interface EnqueuedTask<T> {
    task: PromiseLike<T>
    completion: AsyncVariable<T>
}

export class Barrier<T = any> implements PromiseLike<T[]>, AsyncDisposable {
    readonly queue: EnqueuedTask<T>[] = []

    await(...asyncTasks: PromiseLike<T>[]) {
        for (const asyncTask of asyncTasks)
            this.#run(asyncTask)
    }

    async #run(task: PromiseLike<T>) {
        const completion = new AsyncVariable<T>()
        this.queue.push({ task, completion })
        completion.writeResult(task)
    }

    run(...asyncFunctions: (() => PromiseLike<T>)[]) {
        for (const func of asyncFunctions)
            this.#run(func())
    }

    clear() {
        this.queue.splice(0, this.queue.length)
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
        onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined
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
