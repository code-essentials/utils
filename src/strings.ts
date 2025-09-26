export type StartsWith<Prefix extends string = string, Body extends string = string> = `${Prefix}${Body}`
export type EndsWith<Suffix extends string = string, Body extends string = string> = `${Body}${Suffix}`

export type Concat<StrArr extends readonly string[] = readonly string[], Separator extends string = ""> =
    StrArr extends readonly [infer S0 extends string, ...infer Rest extends string[]] ?
    Rest extends [] ? S0 : `${S0}${Separator}${Concat<Rest, Separator>}` :
    ""
