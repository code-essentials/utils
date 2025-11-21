import test from 'ava'
import { valuesPrefixed } from './types.js'

test("valuesPrefixed", t => {
    
    const abc = {
        a: '.a',
        b: '.b',
        c: '.c',
    } as const

    const prefix = "prefix1"
    
    const abc_k1 = valuesPrefixed(prefix, abc)
    t.deepEqual(abc_k1, {
        a: `${prefix}${abc.a}`,
        b: `${prefix}${abc.b}`,
        c: `${prefix}${abc.c}`,
    })
})
