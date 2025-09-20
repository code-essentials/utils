export class Lock<Of = void> {
    #isAcquired = false

    get isAcquired() {
        return this.#isAcquired
    }

    acquire(of: Of): LockContext<Of> {
        if (this.#isAcquired)
            throw new Error(Lock.ERR_ACQUIRED)
        this.#isAcquired = true
        return new LockContext(this, of, this.release.bind(this))
    }

    protected release(_context: LockContext<Of>) {
        if (!this.isAcquired)
            throw new Error()

        this.#isAcquired = false
    }

    static readonly ERR_ACQUIRED = 'lock currently acquired'
}

export class LockContext<Of> implements Disposable {
    readonly #release: (conext: LockContext<Of>) => void
    #isAcquired = true

    constructor(
            readonly lock: Lock<Of>,
            readonly of: Of,
            release: (conext: LockContext<Of>) => void
        ) {
        this.#release = release
    }

    release() {
        if (!this.#isAcquired)
            throw new Error(LockContext.ERR_LOCK_RELEASED)

        this.#isAcquired = false
        this.#release(this)
    }

    [Symbol.dispose]() {
        this.release()
    }

    static readonly ERR_LOCK_RELEASED = "lock context already released"
}