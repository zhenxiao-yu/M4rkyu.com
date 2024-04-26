export function getRgbValue(varName) {
    const style = getComputedStyle(document.documentElement);
    const value = style.getPropertyValue(varName);
    if (!value) {
        console.error(`CSS variable ${varName} not found`);
        return null;
    }
    const rgbMatch = value.trim().match(/rgba?\((\d+,\s*\d+,\s*\d+)/i);
    if (rgbMatch && rgbMatch.length > 1) {
        return rgbMatch[1];
    } else {
        console.error(`Failed to extract RGB values from ${value}`);
        return null;
    }
}


export const lightTheme = {
    body:"var(--body-color-light)",
    text:"var(--text-color-light)",
    fontFamily:"'Poppins', sans-serif",
    bodyRgba: "225, 223, 228",
    textRgba: "16,16,16",
}

export const DarkTheme = {
    body:"var(--body-color-dark)",
    text:"var(--text-color-dark)",
    fontFamily:"'Poppins', sans-serif",
    textRgba : "225, 223, 228",
    bodyRgba:"16, 16, 16",

}

export const breakpoints = {
    sm: 20,//em
    md: 30,
    lg: 45,
    xl: 60,
    xxl:75,
  }
  
  export const mediaQueries = key => {
    return style => `@media (max-width: ${key}em) { ${style} }`
  }