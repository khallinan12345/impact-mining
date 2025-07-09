import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Stories } from './pages/Stories';
import { Donate } from './pages/Donate';
import { Dashboard } from './pages/Dashboard';
import { Submit } from './pages/Submit';
import { About } from './pages/About';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/projects" element={<Layout><Projects /></Layout>} />
          <Route path="/projects/:id" element={<Layout><ProjectDetail /></Layout>} />
          <Route path="/stories" element={<Layout><Stories /></Layout>} />
          <Route path="/donate" element={<Layout><Donate /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/submit" element={<Layout><Submit /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;