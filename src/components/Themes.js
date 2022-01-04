export const lightTheme = {
    body:"#FFE01B",
    text:"#241C15",
    fontFamily:"'Ubuntu Mono', monospace",
    bodyRgba : "255, 224, 27",
    textRgba:"36,28,21",
}

export const DarkTheme = {
    body:"#241C15",
    text:"#FFE01B",
    fontFamily:"'Ubuntu Mono', monospace",
    textRgba : "252, 246, 244",
    bodyRgba:"36,28,21",

}

// You can also use these breakpoints after importing it and use it as breakpoints.sm
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