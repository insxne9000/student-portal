
import React, { useState } from "react";

function Login() {
    const [matric, setMatric] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log({ matric, password });
    };

    return (
        <div className="login-container" class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Matric no"
                    value={matric}
                    onChange={(e) => setMatric(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Sign in</button>
            </form>
        </div>
    )

}

export default Login;