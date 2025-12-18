import { createContext, useState, useEffect, Children, useContext } from "react";
import api from "../services/api";

export const AuthContext = createContext({});

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            try {
                const response = await api.get("/me");
                setUser(response.data);
            } catch (err) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadStorageData();
    }, []);

    async function login(email, password) {
        try {
            const response = await api.post("/login", {email, password});
            setUser(response.data.user);
            return true;
        } catch (err) {
            console.error("Erro no login: ", err);
            throw err;
        }
    }

    async function logout () {
        try{
            await api.post("/logout");
            setUser(null);
        }
        catch (err) {
            console.error("Erro no logout: ", err)
        }
    }

    return (
    <AuthContext.Provider
      value={{
        logged: !!user,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context){
        throw new Error("useAuth deve ser utilizado dentro de um AuthProvider")
    }
    return context;
};