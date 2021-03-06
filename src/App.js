import './App.css';
import {useState,useEffect} from 'react';
import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";

function Header(props){
  function clickHandler(event){
    event.preventDefault();
    props.onChangeMode();
  }
  return <header>
    <h1><Link to="/">WEB</Link></h1>
  </header>
}
function Nav(props){
  function clickHandler(event){
    event.preventDefault();
    props.onChangeMode(Number(event.target.dataset.id));
  }
  let lis = [];
  for(let i=0; i<props.topics.length; i++){
    let t = props.topics[i];
    lis.push(<li key={t.id}>
      <Link to={'/read/'+t.id}>{t.title}</Link>
    </li>)
  }
  return <nav>
    <ol>
        {lis}
    </ol>
  </nav>
}
function Article(props){
  return <article>
    <h2>{props.title}</h2>
    {props.body}
  </article>
}
function Read(props){
  let params = useParams();
  let [title, setTitle] = useState(null);
  let [body, setBody] = useState(null);
  useEffect(()=>{
    let callback = async ()=>{
      const request = await fetch('/topics/'+params.id);
      const response = await request.json();
      setTitle(response.title);
      setBody(response.body);
    }
    callback();
  }, [params.id]);
  return <Article title={title} body={body}></Article>
}
function UpdateLink(){
  let params = useParams();
  return <li>
    <Link to={'/update/'+params.id}>Update</Link>
  </li>
}
function Control(props){
  let params = useParams();
  let contextUI = null;
  if(params.id){
    contextUI = <>
      <li><Link to={'/update/'+params.id}>Update</Link></li>
      <li><input type="button" value="Delete" onClick={()=>{
        props.onDelete(params.id);
      }}></input></li>
    </>
  }
  return <ol>
    <li><Link to="/create">Create</Link></li>
    {contextUI}
  </ol>
}
function Create(props){
  return <article>
    <form onSubmit={async event=>{
      event.preventDefault();
      let t = event.target.title.value;
      let b = event.target.body.value;
      let request = await fetch('/topics', {
        method:'POST', 
        headers:{
          'Content-Type':'application/json'
        }, 
        body:JSON.stringify({title:t, body:b})
      })
      let response = await request.json();
      props.onCreate({id: response.id, title:t, body:b});
    }}>
      <p><input type="text" name="title" placeholder="Title" /></p>
      <p><textarea name="body" placeholder="Body"></textarea></p>
      <p><input type="submit" value="Create" /></p>
    </form>
  </article>
}
function Update(props){
  let params = useParams();
  let _title, _body = '';
  for(let i=0; i<props.topics.length; i++){
    let t = props.topics[i];
    if(t.id === Number(params.id)){
      _title = t.title;
      _body = t.body;
      break;
    }
  }
  let [title, setTitle] = useState(_title);
  let [body, setBody] = useState(_body);
  return <article>
    <form onSubmit={async event=>{
      event.preventDefault();
      let t = event.target.title.value;
      let b = event.target.body.value;
      let request = await fetch('/topics/'+params.id, {
        method:'PUT', 
        headers:{
          'Content-Type':'application/json'
        }, 
        body:JSON.stringify({title:t, body:b})
      })
      let response = await request.json();
      props.onUpdate({id:params.id, title:t, body:b});
    }}>
      <p><input type="text" name="title" placeholder="Title" value={title} onChange={e=>{setTitle(e.target.value)}} /></p>
      <p><textarea name="body" placeholder="Body" value={body} onChange={e=>{setBody(e.target.value)}}></textarea></p>
      <p><input type="submit" value="Create" /></p>
    </form>
  </article>
}
function App() {
  let [topics, setTopics] = useState([]);
  let navigate = useNavigate();
  let refreshTopics = async ()=>{
    const request = await fetch('/topics');
    const response = await request.json();
    setTopics(response);
  }
  useEffect(()=>{
    refreshTopics();
  }, []);
  function createHandler(data){
    navigate('/read/'+data.id);
    refreshTopics();
  }
  function updateHandler(data){
    navigate('/read/'+data.id);
    refreshTopics();
  }
  async function deleteHandler(id){
    let request = await fetch('/topics/'+id, {
      method:'DELETE'
    })
    let response = await request.json();
    navigate('/');
    refreshTopics();
  }
  return (
        <> 
          <Header></Header>
          <Nav topics={topics}></Nav>
          <Routes>
            <Route path="/" element={<Article title="Welcome" body="Hello, WEB"></Article>}></Route>
            <Route path="/read/:id" element={<Read topics={topics}></Read>}></Route>
            <Route path="/create" element={<Create onCreate={createHandler}></Create>}></Route>
            <Route path="/update/:id" element={<Update topics={topics} onUpdate={updateHandler}></Update>}></Route>
          </Routes>
          <Routes>
            <Route path="/" element={<Control></Control>}></Route>
            <Route path="/read/:id" element={<Control onDelete={deleteHandler}></Control>}></Route>
          </Routes>
        </>
  );
}
export default App;
