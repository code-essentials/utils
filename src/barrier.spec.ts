import test from 'ava'
import { Barrier } from './barrier.js'
import { AsyncVariable } from './async-variable.js'

async function delayedValue<T>(ms: number, value: T) {
    await AsyncVariable.wait(ms)
    return value
}

test("barrier passes with no awaited", async t => {
    const barrier = new Barrier()

    t.timeout(100)
    t.plan(1)

    await barrier.complete()

    t.pass()
})

test("barrier passes with 1 awaited", async t => {
    const barrier = new Barrier()

    t.timeout(100)
    t.plan(1)

    barrier.await(delayedValue(50, 1))

    await barrier
    
    t.pass()
})

test("barrier passes with 3 awaited, values returned", async t => {
    const barrier = new Barrier()

    t.plan(1)

    barrier.await(delayedValue(50, 1))
    barrier.await(delayedValue(40, 2))
    barrier.await(delayedValue(30, 3))

    const res = await barrier
    
    t.deepEqual(res, [1, 2, 3])
})

test("barrier.complete() lets new items await", async t => {
    const barrier = new Barrier()

    t.timeout(100)
    t.plan(2)

    barrier.await(delayedValue(50, 1))
    barrier.await(delayedValue(40, 2))
    barrier.await(delayedValue(30, 3))

    const res0 = await barrier.complete()
    t.deepEqual(res0, [1, 2, 3])

    barrier.await(delayedValue(20, 8))
    barrier.await(delayedValue(40, 9))

    const res1 = await barrier.complete()
    t.deepEqual(res1, [8, 9])
})

test("barrier.clear() removes current items", async t => {
    const barrier = new Barrier()

    t.timeout(50)
    t.plan(2)

    barrier.await(delayedValue(50, 1))
    barrier.await(delayedValue(40, 2))
    barrier.await(delayedValue(30, 3))
    
    barrier.clear()

    const res0 = await barrier.complete()
    t.deepEqual(res0, [])

    barrier.await(delayedValue(20, 8))
    barrier.await(delayedValue(40, 9))

    const res1 = await barrier.complete()
    t.deepEqual(res1, [8, 9])
})

test("barrier not disposed until complete", async t => {
    const a = new AsyncVariable<void>()

    t.timeout(100)
    t.plan(2)

    {
        await using barrier = new Barrier()
        async function f() {
            await delayedValue(50, undefined)
            a.set()
        }
        barrier.await(f())
        t.false(a.complete)
    }

    t.true(a.complete)
})
