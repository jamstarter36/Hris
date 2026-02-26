  import LoginLogo from '../images/AardenceLogo2.png'
  import { FaUserTie } from "react-icons/fa";
  import { FaLock } from "react-icons/fa";
  import { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { useAuth } from '../context/AuthStorage';
  import { loginUser } from '../api/auth';

  const ROLE_ROUTES = {
    Admin:   "/dashboard",
    Manager: "/dashboard",
    User:    "/dashboard",
  };

  export const LoginPage = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async () => {
      if (!username || !password) {
        setError("Please fill in all fields.");
        return;
      }

      setError("");
      setLoading(true);

      try {
        const data = await loginUser(username, password);

        login(data.user, data.token);

        const route = ROLE_ROUTES[data.user.role] || "/dashboard";
        navigate(route, { replace: true });

      } catch (err) {
        const message =
          err.response?.data?.message || "Invalid username or password.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") handleLogin();
    };

    return (
      <>
        <div className='text-black '>
          <div className="flex justify-center items-center gap-2 bg-white/50 backdrop-blur-none p-4">
            <div>
              <img src={LoginLogo} className='w-20 h-20' />
            </div>
            <div>
              <span className='text-xl fontfamily font-bold'>Aardence</span> <br />
              <span className='fontfamily'>Human Resources Information System</span>
            </div>
          </div>
          <div className='flex flex-col justify-center items-center mt-20'>
            <div className='relative flex flex-col justify-center items-center bg-white/50 ackdrop-blur-none rounded-t-md p-5'>
              <div>
                <FaUserTie className="absolute 
                          left-8 top-1/2 -translate-y-1/2 
                          text-gray-400 w-8 h-8 border-r-2 
                          border-gray-300 pr-1" />
              </div>
              <input
                type="text"
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
                className='w-full py-1 rounded-md 
                      border-2 border-gray-300 bg-white text-gray-900 placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                      transition duration-200 ease-in-out shadow-sm pl-15 pr-3 fontfamily'/>
            </div>
            <div className='relative flex flex-col justify-center items-center bg-white/50 ackdrop-blur-none rounded-b-md p-5 shadow-md'>
              <div>
                <FaLock className="absolute 
                          left-8 top-1/2 -translate-y-1/2 
                          text-gray-400 w-8 h-8 border-r-2 
                          border-gray-300 pr-1" />
              </div>
              <input
                type="password"
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className='w-full py-1 rounded-md border-2 
                      border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none 
                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out 
                      shadow-sm pl-15 pr-3 fontfamily'/>
            </div>
          </div>
          <div className='flex justify-center items-center mt-3'>
            <p className={`animate-pulse text-red-500 text-sm transition-all duration-500 ease-out
                      ${error ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"}`}>
              {error || ""}
            </p>
          </div>
          <div className='flex justify-center items-center mt-5'>
            <button
              onClick={handleLogin}
              disabled={loading}
              className='w-40 h-10 bg-blue-900 rounded-xl text-white hover:text-black 
                  transform transition-transform duration-700 
                  hover:scale-115 hover:bg-blue-300 fontfamily shadow-md
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-blue-900 disabled:hover:text-white'
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>
        </div>
      </>
    );
  }

