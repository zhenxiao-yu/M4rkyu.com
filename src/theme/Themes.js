export const lightTheme = {
    body:"var(--body-color-light)",
    text:"var(--text-color-light)",
    fontFamily:"'Ubuntu Mono', monospace",
    bodyRgba : "135, 210, 113",
    textRgba:"16, 16, 16",
}

export const DarkTheme = {
    body:"var(--body-color-dark)",
    text:"var(--text-color-dark)",
    fontFamily:"'Ubuntu Mono', monospace",
    textRgba : "135, 210, 113",
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