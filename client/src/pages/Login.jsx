import React, { useState } from "react";
import logo from "../assets/logo.png";

function Login() {
    const [matric, setMatric] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ matric, password });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#2a0e3b] to-[#51185a] p-4 font-sans">
            
            <div className="w-full max-w-[728px] md:h-[810px] bg-white/[0.14] backdrop-blur-md border-2 border-white/20 rounded-[50px] shadow-2xl flex flex-col items-center pt-[40px] px-8 md:pr-[78px] pb-[60px] md:pb-[118px] md:pl-[99px]">
                <div className="w-[100px] h-[100px] mb-6 flex items-center justify-center bg-white rounded-full p-2 shadow-inner">
                    <img 
                        src={logo} 
                        alt="University Logo" 
                        className="w-[100px] h-[100px] mb-6 object-contain"
                    />
                </div>

                <h1 className="text-white text-4xl font-semibold mb-2 text-center tracking-wide">
                    Welcome back
                </h1>
                <p className="text-white/80 text-lg mb-12 text-center">
                    Please enter your details
                </p>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-white font-medium text-[15px]">Matric No.</label>
                        <input
                            type="text"
                            placeholder="Enter your matric no."
                            value={matric}
                            onChange={(e) => setMatric(e.target.value)}
                            required
                            className="bg-transparent border-b border-white/30 pb-2 text-white placeholder-white/50 focus:outline-none focus:border-white transition-colors"
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
                        className="mt-6 w-full bg-[#401a4f] hover:bg-[#30133c] text-white py-[18px] rounded-2xl font-semibold text-lg transition-colors shadow-lg"
                    >
                        Sign In
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Login;