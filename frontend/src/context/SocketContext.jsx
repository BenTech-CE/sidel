import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { apiURL } from "../services/api";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const s = io(apiURL, { withCredentials: true });
        setSocket(s);
        //s.connect();

        return () => {
            if (s) {
                s.off();
                s.disconnect();
            }
            setSocket(null);
        };
    }, [apiURL]);

    const value = {
        socket,
        connect: () => socket?.connect(),
        disconnect: () => socket?.disconnect(),
        on: (event, cb) => socket?.on(event, cb),
        off: (event, cb) => socket?.off(event, cb),
        emit: (event, ...args) => socket?.emit(event, ...args),
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);

export default SocketProvider;