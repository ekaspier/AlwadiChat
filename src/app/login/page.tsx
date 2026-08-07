"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { loginUser } from "@/auth/firebaseAuth";


export default function Login() {


  const router = useRouter();


  const [email,setEmail] = useState("");

  const [password,setPassword] = useState("");

  const [message,setMessage] = useState("");





  async function handleLogin(){


    try{


      await loginUser(
        email,
        password
      );


      router.push("/");


    }catch(error:any){


      setMessage(error.message);


    }


  }







  return (

    <main className="h-screen bg-black text-white flex items-center justify-center">


      <div className="w-full max-w-md bg-gray-900 p-8 rounded-3xl">



        <h1 className="text-3xl font-bold mb-6 text-center">

          Login

        </h1>






        <input

          className="w-full bg-black border border-gray-700 rounded-xl p-4 mb-4 outline-none"

          placeholder="Email"

          value={email}

          onChange={(e)=>setEmail(e.target.value)}

        />







        <input

          className="w-full bg-black border border-gray-700 rounded-xl p-4 mb-4 outline-none"

          placeholder="Password"

          type="password"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

        />







        <button

          onClick={handleLogin}

          className="w-full bg-white text-black p-4 rounded-xl font-bold"

        >

          Login

        </button>








        <button

          onClick={()=>router.push("/register")}

          className="w-full mt-4 bg-gray-800 text-white p-4 rounded-xl font-bold"

        >

          إنشاء حساب جديد ✨

        </button>







        <p className="text-center mt-4 text-gray-400">

          {message}

        </p>




      </div>


    </main>

  );

}