import test from 'ava'
import { log } from './log.js'

test('log', t => {
    using log1 = log('statement1')
    void log1

    {
        using log2 = log('statement2')
        void log2
    }

    using log3 = log('statement3')
    void log3

    t.pass() // observed correct
})
