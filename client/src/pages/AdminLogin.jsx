import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        
        // Hardcoded admin check
        if (username === "admin" && password === "admin") {
            localStorage.setItem('adminToken', 'mock-admin');
            navigate("/admin");
        } else {
            setError("Invalid admin credentials");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 to-[#51185a] p-4 font-sans">
            <div className="w-full max-w-md bg-white/[0.14] backdrop-blur-md border-2 border-white/20 rounded-[30px] shadow-2xl flex flex-col items-center p-10">
                <div className="w-[80px] h-[80px] mb-6 flex items-center justify-center bg-white rounded-2xl shadow-inner overflow-hidden border-2 border-white">
                    <img src={logo} alt="University Logo" className="w-full h-full object-cover bg-white" />
                </div>
                <h1 className="text-white text-3xl font-semibold mb-2 text-center tracking-wide">
                    Admin Portal
                </h1>
                <p className="text-white/80 text-sm mb-8 text-center">
                    Authorized Personnel Only
                </p>

                {error && (
                    <div className="w-full bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-6 text-center text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-white/80 font-medium ml-1">Username</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="e.g. admin" 
                            required
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-lg"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-white/80 font-medium ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-lg tracking-widest"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="mt-4 w-full bg-red-800 hover:bg-red-700 text-white py-4 rounded-xl font-semibold text-lg transition-colors shadow-lg"
                    >
                        Secure Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AdminLogin;
