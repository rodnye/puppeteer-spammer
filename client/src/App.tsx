import { Route, Switch } from 'wouter';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetails';
import GroupManagement from './pages/GroupManagement';
import PostManagement from './pages/PostManagement';
import SessionUpload from './pages/SessionUpload';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/tasks" component={TaskList} />
          <Route path="/tasks/:taskId" component={TaskDetail} />
          <Route path="/groups" component={GroupManagement} />
          <Route path="/posts" component={PostManagement} />
          <Route path="/session" component={SessionUpload} />
        </Switch>
      </main>
    </div>
  );
}

export default App;
