import Home from './pages/Home';
import BlogCopy from './pages/BlogCopy';
import Team from './pages/Team';

const routes = [
  { path: '/', component: <Home />, exact: true },
  { path: '/blog', component: <BlogCopy /> },
  { path: '/team', component: <Team /> },
];

export default routes;