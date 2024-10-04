import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Connection() {
    const [connections, setConnections] = useState([]);

    useEffect(() => {
        async function fetchConnections() {
            const response = await axios.get('http://localhost:8000/connections/recommendations');
            setConnections(response.data);
        }
        fetchConnections();
    }, []);

    const approveConnection = async (connectionId) => {
        await axios.post(`http://localhost:8000/connections/approve/${connectionId}`);
    };

    return (
        <div>
            <h2>Recommended Connections</h2>
            <ul>
                {connections.map((conn) => (
                    <li key={conn.id}>
                        {conn.name}
                        <button onClick={() => approveConnection(conn.id)}>Approve</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Connection;
