export type Deleteable<T, K extends keyof T = keyof T> = {
    -readonly [K1 in K]?: T[K1]
}

export type PartlyDeleteable<T, K extends keyof T> = {
    [K1 in keyof T as (K1 extends K ? never : K1)]: T[K1]
} & Deleteable<T, K>

export type PartiallyPartial<T, K extends keyof T> = Omit<T, K> & Deleteable<Pick<T, K>>

export type UndefinedIf<T, Condition extends boolean = boolean> = Condition extends true ? undefined : T

export function undefinedIf<T, Condition extends boolean = boolean>(condition: Condition, item: () => T): UndefinedIf<T, Condition> {
    return <UndefinedIf<T, Condition>>(condition ? undefined : item())
}

export type Prefixed<Prefix extends string, T extends object> = {
    [K in string & keyof T as `${Prefix}${K}`]: T[K]
}

export function prefixed<Prefix extends string, T extends object>(prefix: Prefix, o: T): Prefixed<Prefix, T> {
    return <Prefixed<Prefix, T>>Object.fromEntries(Object.entries(o).map(([k, v]) => [`${prefix}${k}`, v] as const))
}

export type RemovePrefix<Prefix extends string, T extends object> =
    T extends Prefixed<Prefix, infer Unprefixed> ? Unprefixed : {
    [K in string & keyof T as K extends `${Prefix}${infer K1}` ? K1 : never]: T[K]
}

export function removePrefix<const Prefix extends string, const T extends object>(prefix: Prefix, o: T): RemovePrefix<Prefix, T> {
    return <RemovePrefix<Prefix, T>>Object.fromEntries(
        Object.entries(o)
            .filter(([k]) => k.startsWith(prefix) && k.length > prefix.length)
            .map(([k, v]) => [k.substring(prefix.length), v] as const)
    )
}

export function assert<_Assertion extends true>() { }

export type Eq<A, B> = A extends B ? B extends A ? true : false : false

export type Extends<A, B> = A extends B ? true : false

export function never(): never {
    throw new Error("never")
}

export type Mutable<T> = { -readonly [K in keyof T]: T[K] }
