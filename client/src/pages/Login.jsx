import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

function Login() {
    const [matric, setMatric] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await axios.post(`${apiBaseUrl}/api/auth/login`, {
                matric,
                password
            });
            
            // Store token
            localStorage.setItem('token', response.data.token);
            
            // Navigate to dashboard
            navigate("/");
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("An error occurred during login.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2a0e3b] to-[#51185a] p-4 font-sans">
            
            <div className="w-full max-w-md bg-white/[0.14] backdrop-blur-md border-2 border-white/20 rounded-[30px] shadow-2xl flex flex-col items-center p-10">
                <div className="w-[100px] h-[100px] mb-6 flex items-center justify-center bg-white rounded-2xl shadow-inner overflow-hidden border-2 border-white">
                    <img 
                        src={logo} 
                        alt="University Logo" 
                        className="w-full h-full object-cover bg-white"
                    />
                </div>

                <h1 className="text-white text-4xl font-semibold mb-2 text-center tracking-wide">
                    Welcome back
                </h1>
                <p className="text-white/80 text-lg mb-8 text-center">
                    Please enter your details
                </p>

                {error && (
                    <div className="w-full bg-red-500/20 border border-red-500/50 text-white p-3 rounded-lg mb-6 text-center text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-white/80 font-medium ml-1">Matric No.</label>
                        <input 
                            type="text" 
                            value={matric}
                            onChange={(e) => setMatric(e.target.value)}
                            placeholder="e.g. 2022/502" 
                            required
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 transition-all text-lg"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-white font-medium text-[15px]">Password</label>
                        <input
                            type="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-transparent border-b border-white/30 pb-2 text-white placeholder-white/50 tracking-widest focus:outline-none focus:border-white transition-colors"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="mt-6 w-full bg-[#401a4f] hover:bg-[#30133c] disabled:opacity-50 disabled:cursor-not-allowed text-white py-[18px] rounded-2xl font-semibold text-lg transition-colors shadow-lg flex justify-center items-center"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Login;