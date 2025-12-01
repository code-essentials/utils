import { AsyncVariable } from "./async-variable.js"

interface EnqueuedTask<T> {
    task: PromiseLike<T>
    completion: AsyncVariable<T>
}

export class Barrier<T = any> implements PromiseLike<T[]> {
    readonly queue: EnqueuedTask<T>[] = []

    await(...asyncTasks: PromiseLike<T>[]) {
        this.run(...asyncTasks)
    }

    async #run(task: PromiseLike<T>) {
        const completion = new AsyncVariable<T>()
        this.queue.push({ task, completion })
        completion.writeResult(task)
    }

    run(...asyncTasks: PromiseLike<T>[]) {
        for (const task of asyncTasks)
            this.#run(task)
    }

    clear() {
        this.queue.splice(0, this.queue.length)
    }

    async complete() {
        const result = await this
        this.clear()
        return result
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
