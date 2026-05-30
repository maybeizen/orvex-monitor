import { UserAvatarType, type PublicUser } from "@orvex/types";

function md5(input: string): string {
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    a = (a + q + x + t) | 0;
    return (((a << s) | (a >>> (32 - s))) + b) | 0;
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const bytes = new TextEncoder().encode(input);
  const len = bytes.length;
  const words: number[] = [];
  for (let i = 0; i < len; i++) {
    words[i >> 2] = words[i >> 2] ?? 0;
    words[i >> 2]! |= bytes[i]! << ((i % 4) * 8);
  }
  words[len >> 2] = words[len >> 2] ?? 0;
  words[len >> 2]! |= 0x80 << ((len % 4) * 8);
  words[(((len + 8) >>> 6) << 4) + 14] = len * 8;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < words.length; i += 16) {
    const oa = a;
    const ob = b;
    const oc = c;
    const od = d;

    a = ff(a, b, c, d, words[i] ?? 0, 7, -680876936);
    d = ff(d, a, b, c, words[i + 1] ?? 0, 12, -389564586);
    c = ff(c, d, a, b, words[i + 2] ?? 0, 17, 606105819);
    b = ff(b, c, d, a, words[i + 3] ?? 0, 22, -1044525330);
    a = ff(a, b, c, d, words[i + 4] ?? 0, 7, -176418897);
    d = ff(d, a, b, c, words[i + 5] ?? 0, 12, 1200080426);
    c = ff(c, d, a, b, words[i + 6] ?? 0, 17, -1473231341);
    b = ff(b, c, d, a, words[i + 7] ?? 0, 22, -45705983);
    a = ff(a, b, c, d, words[i + 8] ?? 0, 7, 1770035416);
    d = ff(d, a, b, c, words[i + 9] ?? 0, 12, -1958414417);
    c = ff(c, d, a, b, words[i + 10] ?? 0, 17, -42063);
    b = ff(b, c, d, a, words[i + 11] ?? 0, 22, -1990404162);
    a = ff(a, b, c, d, words[i + 12] ?? 0, 7, 1804603682);
    d = ff(d, a, b, c, words[i + 13] ?? 0, 12, -40341101);
    c = ff(c, d, a, b, words[i + 14] ?? 0, 17, -1502002290);
    b = ff(b, c, d, a, words[i + 15] ?? 0, 22, 1236535329);

    a = gg(a, b, c, d, words[i + 1] ?? 0, 5, -165796510);
    d = gg(d, a, b, c, words[i + 6] ?? 0, 9, -1069501632);
    c = gg(c, d, a, b, words[i + 11] ?? 0, 14, 643717713);
    b = gg(b, c, d, a, words[i] ?? 0, 20, -373897302);
    a = gg(a, b, c, d, words[i + 5] ?? 0, 5, -701558691);
    d = gg(d, a, b, c, words[i + 10] ?? 0, 9, 38016083);
    c = gg(c, d, a, b, words[i + 15] ?? 0, 14, -660478335);
    b = gg(b, c, d, a, words[i + 4] ?? 0, 20, -405537848);
    a = gg(a, b, c, d, words[i + 9] ?? 0, 5, 568446438);
    d = gg(d, a, b, c, words[i + 14] ?? 0, 9, -1019803690);
    c = gg(c, d, a, b, words[i + 3] ?? 0, 14, -187363961);
    b = gg(b, c, d, a, words[i + 8] ?? 0, 20, 1163531501);
    a = gg(a, b, c, d, words[i + 13] ?? 0, 5, -1444681467);
    d = gg(d, a, b, c, words[i + 2] ?? 0, 9, -51403784);
    c = gg(c, d, a, b, words[i + 7] ?? 0, 14, 1735328473);
    b = gg(b, c, d, a, words[i + 12] ?? 0, 20, -1926607734);

    a = hh(a, b, c, d, words[i + 5] ?? 0, 4, -378558);
    d = hh(d, a, b, c, words[i + 8] ?? 0, 11, -2022574463);
    c = hh(c, d, a, b, words[i + 11] ?? 0, 16, 1839030562);
    b = hh(b, c, d, a, words[i + 14] ?? 0, 23, -35309556);
    a = hh(a, b, c, d, words[i + 1] ?? 0, 4, -1530992060);
    d = hh(d, a, b, c, words[i + 4] ?? 0, 11, 1272893353);
    c = hh(c, d, a, b, words[i + 7] ?? 0, 16, -155497632);
    b = hh(b, c, d, a, words[i + 10] ?? 0, 23, -1094730640);
    a = hh(a, b, c, d, words[i + 13] ?? 0, 4, 681279174);
    d = hh(d, a, b, c, words[i] ?? 0, 11, -358537222);
    c = hh(c, d, a, b, words[i + 3] ?? 0, 16, -722521979);
    b = hh(b, c, d, a, words[i + 6] ?? 0, 23, 76029189);
    a = hh(a, b, c, d, words[i + 9] ?? 0, 4, -640364487);
    d = hh(d, a, b, c, words[i + 12] ?? 0, 11, -421815835);
    c = hh(c, d, a, b, words[i + 15] ?? 0, 16, 530742520);
    b = hh(b, c, d, a, words[i + 2] ?? 0, 23, -995338651);

    a = ii(a, b, c, d, words[i] ?? 0, 6, -198630844);
    d = ii(d, a, b, c, words[i + 7] ?? 0, 10, 1126891415);
    c = ii(c, d, a, b, words[i + 14] ?? 0, 15, -1416354905);
    b = ii(b, c, d, a, words[i + 5] ?? 0, 21, -57434055);
    a = ii(a, b, c, d, words[i + 12] ?? 0, 6, 1700485571);
    d = ii(d, a, b, c, words[i + 3] ?? 0, 10, -1894986606);
    c = ii(c, d, a, b, words[i + 10] ?? 0, 15, -1051523);
    b = ii(b, c, d, a, words[i + 1] ?? 0, 21, -2054922799);
    a = ii(a, b, c, d, words[i + 8] ?? 0, 6, 1873313359);
    d = ii(d, a, b, c, words[i + 15] ?? 0, 10, -30611744);
    c = ii(c, d, a, b, words[i + 6] ?? 0, 15, -1560198380);
    b = ii(b, c, d, a, words[i + 13] ?? 0, 21, 1309151649);
    a = ii(a, b, c, d, words[i + 4] ?? 0, 6, -145523070);
    d = ii(d, a, b, c, words[i + 11] ?? 0, 10, -1120210379);
    c = ii(c, d, a, b, words[i + 2] ?? 0, 15, 718787259);
    b = ii(b, c, d, a, words[i + 9] ?? 0, 21, -343485551);

    a = (a + oa) | 0;
    b = (b + ob) | 0;
    c = (c + oc) | 0;
    d = (d + od) | 0;
  }

  return [a, b, c, d]
    .map((n) => {
      const hex = (n >>> 0).toString(16).padStart(8, "0");
      return hex.match(/../g)!.reverse().join("");
    })
    .join("");
}

export function getAvatarSrc(user: PublicUser): string | null {
  if (user.avatarType === UserAvatarType.Upload && user.avatarUrl) {
    return user.avatarUrl;
  }
  if (user.avatarType === UserAvatarType.Gravatar) {
    const gravatarEmail = user.gravatarEmail ?? user.email;
    const hash = md5(gravatarEmail.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=mp&s=128`;
  }
  return null;
}
