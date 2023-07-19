export function to_TitleCase(str: string): string {
  str = replaceUmlaute(str);
  return str
    .replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    })
    .replace(/\W/g, "");
}

export function to_UPPER_CASE(str: string): string {
  str = replaceUmlaute(str);
  return str
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_]/g, "")
    .toUpperCase();
}

export function to_camelCase(str: string): string {
  const res = to_TitleCase(str);
  return res.charAt(0).toLowerCase() + res.slice(1);
}

const umlautMap: Record<string, string> = {
  "\u00dc": "UE",
  "\u00c4": "AE",
  "\u00d6": "OE",
  "\u00fc": "ue",
  "\u00e4": "ae",
  "\u00f6": "oe",
  "\u00df": "ss",
};

function replaceUmlaute(str: string): string {
  return str
    .replace(/[\u00dc|\u00c4|\u00d6][a-z]/g, (a) => {
      const big = umlautMap[a.slice(0, 1)];
      return big.charAt(0) + big.charAt(1).toLowerCase() + a.slice(1);
    })
    .replace(
      new RegExp("[" + Object.keys(umlautMap).join("|") + "]", "g"),
      (a) => umlautMap[a]
    );
}

export function assertReturnCode(res: { status: number }, code: number): void {
  if (res.status !== code) {
    const msg = `Return code '${res.status}' is not '${code}.'`;
    console.error(msg);
    throw Error(msg);
  }
}
