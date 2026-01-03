import { Switch, Route, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import GlobalStyle from "./theme/globalStyles";
import { ThemeProvider } from "styled-components";
import { lightTheme } from "./theme/Themes";
import Loading from "./components/Loading";
import UploadForm from "./pages/Upload/UploadformPage";
import SiteNavigation from "./components/SiteNavigation";
import SiteFooter from "./components/SiteFooter";

// Components
const Main = lazy(() => import("./pages/Main/Main"));
const AboutPage = lazy(() => import("./pages/About/AboutPage"));
const MySkillsPage = lazy(() => import("./pages/Skills/MySkillsPage"));
const BlogPage = lazy(() => import("./pages/Blog/BlogPage"));
const ProjectPage = lazy(() => import("./pages/Projects/ProjectPage"));
const GalleryPage = lazy(() => import("./pages/Gallery/GalleryPage"));
const SoundBar = lazy(() => import("./components/SoundBar"));
const NotFoundPage = lazy(() => import("./pages/Error/NotFoundPage"));
const ContactPage = lazy(() => import("./pages/Contact/ContactPage"));
const SitemapPage = lazy(() => import("./pages/Sitemap/SitemapPage"));

function Router() {
  const location = useLocation();

  return (
    <>
      <GlobalStyle />
      <ThemeProvider theme={lightTheme}>
        <Suspense fallback={<Loading />}>
          <SiteNavigation />
          <SoundBar />
          <main id="main-content">
            <Switch location={location} key={location.pathname}>
              <Route exact path="/" component={Main} />
              <Route exact path="/about" component={AboutPage} />
              <Route exact path="/post" component={BlogPage} />
              <Route exact path="/blog" component={BlogPage} />
              <Route exact path="/project" component={ProjectPage} />
              <Route exact path="/projects" component={ProjectPage} />
              <Route exact path="/skills" component={MySkillsPage} />
              <Route exact path="/gallery" component={GalleryPage} />
              <Route path="/gallery/:section" component={GalleryPage} />
              <Route exact path="/contact" component={ContactPage} />
              <Route exact path="/sitemap" component={SitemapPage} />
              <Route exact path="/admin" component={UploadForm} />
              <Route component={NotFoundPage} />
            </Switch>
          </main>
          <SiteFooter />
        </Suspense>
      </ThemeProvider>
    </>
  );
}

export default Router;
