import { baminiToUnicode } from "./transliteration/TaFontToUnicode"
import { fmAbayaToUnicode } from "./transliteration/SIFontToUnicode"
import { singlishToUnicode } from "./transliteration/SinglishToUnicode"
import { tanglishToUnicode } from "./transliteration/TanglishToUnicode"

type Transliterator = (text: string) => string

function convertOutsideBracketTitles(text: string, converter: Transliterator) {
    // Keep section titles and chord tags like [Verse] or [G] untouched.
    return text
        .split(/(\[[^\]]*\])/g)
        .map((part) => {
            if (part.startsWith("[") && part.endsWith("]")) return part
            return converter(part)
        })
        .join("")
}

export function convertTaFontToUnicode(text: string) {
    return convertOutsideBracketTitles(text, baminiToUnicode)
}

export function convertSiFontToUnicode(text: string) {
    return convertOutsideBracketTitles(text, fmAbayaToUnicode)
}

export function convertSinglishToUnicode(text: string) {
    return convertOutsideBracketTitles(text, singlishToUnicode)
}

export function convertTanglishToUnicode(text: string) {
    return convertOutsideBracketTitles(text, tanglishToUnicode)
}
