import React, { useState, useEffect, FC }  from 'react'

interface Log{
    type: string,
    message: string
}
interface LogDisplayProp {
    vendor : string,
    getColor: (type:string)=>string 
}
const LogDisplay:FC<LogDisplayProp> = ({vendor,getColor}) =>{

    const [logs, setLogs] = useState<Log[]>([]);

    useEffect(() => {
        const eventSource = new EventSource(`http://localhost:4000/events?vendor=${vendor}`);
    
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setLogs((prevLogs) => [...prevLogs, data]);
        };
    
        eventSource.onerror = (error) => {
          console.error('SSE error:', error);
        };
    
        return () => {
          eventSource.close();
        };
      }, [vendor]);


    return(
        <div className="logs" style={{ backgroundColor: 'black' }}>
        <h3 style={{ color: 'white' }}>Product Logs for {vendor}:</h3>
        <ul>
          {logs.map((log, index) => (
            <li key={index} style={{ color: getColor(log.type) }}>{log.message}</li>
          ))}
        </ul>
      </div>
    )
}

export default LogDisplay;



