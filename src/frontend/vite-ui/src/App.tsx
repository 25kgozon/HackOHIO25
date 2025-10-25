import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [event, setEvent] = useState(null)
  const eventRef = useRef(event);
  const [val, setVal] = useState("");
  const [status, setStatus] = useState("");


  useEffect(()=>{
    eventRef.current = event;
  }, [event])

    useEffect(() => {
      // Start the interval
      const intervalId = setInterval(() => {
        console.log("int: " + eventRef.current);
        if (event == null || !!event["status"]) return;
        fetch(`/api/event/${eventRef.current}`).then(x => x.json()).then(x => setStatus(x));


      }, 1000);

      // Cleanup on unmount
      return () => clearInterval(intervalId);
    }, [event]);

  function exec(){

    fetch("/api/add", {
      method:"POST",
      body:val
    }).then(x => x.text()).then((value)=>{
        console.log(value);
        setEvent(value*1);
    });
  }





  let x = !event ?(<>
    <textarea onInput={(x)=>setVal(x.target.value)}></textarea>
    <br />
    <button onClick={exec}> Run </button>
    </>): (<p>
      <code>{JSON.stringify(status)}</code>

    </p>);


  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        {x}


       <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
