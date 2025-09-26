import test, { ExecutionContext } from "ava"
import { Concat, EndsWith, StartsWith } from "./strings.js"

function typeCheck<T>(t: ExecutionContext, _: T) {
    t.pass()
}

test("startsWith", t => {
    const prefix = "abc"
    type startsWith = StartsWith<typeof prefix>
    typeCheck<startsWith>(t, `abc123`)
})

test("endsWith", t => {
    const suffix = "123"
    type endsWith = EndsWith<typeof suffix>
    typeCheck<endsWith>(t, `abc123`)
})

test("concat 0", t => {
    const arr = ["abc", "def", "gh", "ijk"] as const
    type concat = Concat<typeof arr>
    typeCheck<concat>(t, "abcdefghijk")
})

test("concat 1", t => {
    const arr = ["abc", "def", "gh", "ijk"] as const
    type concat = Concat<typeof arr, ' '>
    typeCheck<concat>(t, "abc def gh ijk")
})
