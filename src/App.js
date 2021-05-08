import React, {Component} from 'react'
import { Route } from 'react-router-dom'
import ListAdventures from "./page/kolobok/adventures";
const Home = () => <h1>Home</h1>
// const About = () => <h1>About</h1>
const Post = () => <h1>Post</h1>
const Project = () => <h1>Project</h1>

class App extends Component {
  render() {
    return (
      <div className="App container">
        <Route path="/" component={Home} />
        <Route path="/kolobok/Adventures" component={ListAdventures} />
        <Route path="/posts" component={Post} />
        <Route path="/projects" component={Project} />
      </div>
    )
  }
}
export default App
