import test from 'ava'
import { assert, DeeplyReadonly, Eq, valuesPrefixed } from './types.js'

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

test("deeply readonly 1", t => {
    interface T0 {
        readonly a: number
        readonly b: boolean
        readonly c: string
    }

    type T1 = DeeplyReadonly<{
        a: number
        b: boolean
        c: string
    }>

    assert<Eq<T0, T1>>()

    t.pass()
})

test("deeply readonly 2", t => {
    interface T0 {
        readonly str: string
        readonly range: readonly [from: number, to: number]
    }

    type T1 = DeeplyReadonly<{
        str: string
        range: [from: number, to: number]
    }>

    assert<Eq<T0, T1>>()

    t.pass()
})

test("deeply readonly 3", t => {
    interface T0 {
        readonly tokens: readonly {
            readonly str: string
            readonly range: readonly [from: number, to: number]
        }[]

        readonly a: {
            readonly b: {
                readonly c: {
                    [1]: 1
                }
            }
        }
    }

    type T1 = DeeplyReadonly<{
        tokens: {
            str: string
            range: [from: number, to: number]
        }[]

        a: { b: { c: { [1]: 1 } } }
    }>

    assert<Eq<T0, T1>>()

    t.pass()
})
