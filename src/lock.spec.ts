import test from "ava"
import { Lock } from "./lock.js"

test('acquire when free', t => {
    const lock = new Lock()
    const context = lock.acquire()
    context.release()
    t.pass()
})

test('fail to acquire when already acquired', t => {
    const lock = new Lock()
    lock.acquire()
    t.throws(() => lock.acquire(), { message: Lock.ERR_ACQUIRED })
})

test('disposable release', t => {
    const lock = new Lock()

    function acquire(pass: boolean) {
        if (pass)
            t.notThrows(() => lock.acquire())
        else
            t.throws(() => lock.acquire(), { message: Lock.ERR_ACQUIRED })
    }

    function acquire_0() {
        using _context1 = lock.acquire()
        acquire(false)
    }

    function acquire_1() {
        acquire(true)
    }

    acquire_0()
    acquire_1()
})
