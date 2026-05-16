import test, { ExecutionContext } from "ava"
import { Concat, EndsWith, StartsWith } from "./strings.js"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function typeCheck<T>(t: ExecutionContext, _: T) {
    t.pass()
}

test("startsWith", t => {
    const prefix = "abc"
    type startsWith = StartsWith<typeof prefix>
    typeCheck<startsWith>(t, `${prefix}123`)
})

test("endsWith", t => {
    const suffix = "123"
    type endsWith = EndsWith<typeof suffix>
    typeCheck<endsWith>(t, `abc${suffix}`)
})

test("concat 0", t => {
    const arr = ["abc", "def", "gh", "ijk"] as const
    type concat = Concat<typeof arr>
    typeCheck<concat>(t, `${arr[0]}${arr[1]}${arr[2]}${arr[3]}`)
})

test("concat 1", t => {
    const arr = ["abc", "def", "gh", "ijk"] as const
    type concat = Concat<typeof arr, ' '>
    typeCheck<concat>(t, `${arr[0]} ${arr[1]} ${arr[2]} ${arr[3]}`)
})
