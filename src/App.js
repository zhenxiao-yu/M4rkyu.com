import { Switch, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import GlobalStyle from "./theme/globalStyles";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "./theme/Themes";
import Loading from "./components/Loading";

//Components
const Main = lazy(() => import("./pages/Main/Main"));
const AboutPage = lazy(() => import("./pages/About/AboutPage"));
const MySkillsPage = lazy(() => import("./pages/Skills/MySkillsPage"));
const BlogPage = lazy(() => import("./pages/Blog/BlogPage"));
const ProjectPage = lazy(() => import("./pages/Projects/ProjectPage"));
const SoundBar = lazy(() => import("./components/SoundBar"));

function App() {
  const location = useLocation();

  return (
    <>
      <GlobalStyle />

      <ThemeProvider theme={lightTheme}>
        <Suspense fallback={<Loading />}>
          <SoundBar />
            <Switch location={location} key={location.pathname}>
              <Route exact path="/" component={Main} />
              <Route exact path="/about" component={AboutPage} />
              <Route exact path="/post" component={BlogPage} />
              <Route exact path="/project" component={ProjectPage} />
              <Route exact path="/skills" component={MySkillsPage} />
            </Switch>
        </Suspense>
      </ThemeProvider>
    </>
  );
}

export default App;
