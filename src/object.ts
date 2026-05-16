export type Values<T extends object> = T[keyof T]

type EntryMap<T> = {
    [K in keyof T]: [K, T[K]]
}

export type Entry<T> = NonNullable<EntryMap<T>[keyof T]>

export function entries<T extends object>(o: T): Entry<T>[] {
    return <Entry<T>[]>Object.entries(o)
}

export type PropertyPath<T> =
    | []
    | T extends object ? Values<{
        [K in keyof T]: [K] | [K, Values<PropertyPath<T[K]>>]
    }> : []

export type PropertyType<T, Property extends PropertyPath<T>> = PropertyType_<T, Property>
type PropertyType_<T, Property extends unknown[], Constructed extends unknown[] = []> =
    (Property & Constructed) extends never ?
    Values<{
        [K in keyof T as Property extends [...Constructed, K, ...unknown[]] ? K : never]:
        PropertyType_<T[K], Property, [...Constructed, K]>
    }> :
    T

// export type PropertyType<T, Property extends PropertyPath<T> & PropertyKey[]> = PropertyType_<T, Property>
// type PropertyType_<T, Property extends PropertyKey[], Constructed extends PropertyKey[] = []> =
//     (Property & Constructed) extends never ?
//     Values<{
//         [K in keyof T as Property extends [...Constructed, K, ...PropertyKey[]] ? K : never]:
//         PropertyType_<T[K], Property, [...Constructed, K]>
//     }> :
//     T

// type A = {
//     a: {
//         a: 10,
//         b: 1
//         c: 2
//     }
//     b: {
//         a: {
//             c: 1
//         }
//     }
// }

// type a_path = PropertyPath<A>
// const ac = ["a", "c"] satisfies a_path
// // type a1 = (typeof ac) extends ["a", "c", ...PropertyKey[]] ? true : false
// type ac_type = PropertyType_<A, typeof ac>

export function replaceProperty<T, Property extends PropertyPath<T> = PropertyPath<T>>(
    obj: T,
    property: Property,
    value: unknown
): T {
    if (property.length === 0)
        return <T>((value) ?? obj)

    if (!(obj instanceof Object))
        throw new Error()

    const prototype = <T>Object.create(obj)

    const property0 = property[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    prototype[property0] = replaceProperty<NonNullable<T>[keyof T]>((<any>obj)[property0], <PropertyPath<T[keyof T]>>property.slice(1), value)
    return prototype
}
