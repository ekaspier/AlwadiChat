"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { registerUser } from "@/auth/firebaseAuth";
import { createUserProfile } from "@/lib/users";


export default function Register() {


  const router = useRouter();


  const [username,setUsername] = useState("");

  const [email,setEmail] = useState("");

  const [password,setPassword] = useState("");

  const [message,setMessage] = useState("");





  async function handleRegister(){


    try{


      const userCredential = await registerUser(
        email,
        password
      );



      const user = userCredential.user;




      await createUserProfile(
        user.uid,
        username,
        email
      );





      setMessage(
        "تم إنشاء الحساب بنجاح ✅"
      );





      setTimeout(()=>{


        router.push("/");


      },500);





    }catch(error:any){


      setMessage(error.message);


    }


  }






  return (

    <main className="h-screen bg-black text-white flex items-center justify-center">


      <div className="w-full max-w-md bg-gray-900 p-8 rounded-3xl">



        <h1 className="text-3xl font-bold mb-6 text-center">

          Create Account

        </h1>





        <input

          className="w-full bg-black border border-gray-700 rounded-xl p-4 mb-4"

          placeholder="Username"

          value={username}

          onChange={(e)=>setUsername(e.target.value)}

        />





        <input

          className="w-full bg-black border border-gray-700 rounded-xl p-4 mb-4"

          placeholder="Email"

          value={email}

          onChange={(e)=>setEmail(e.target.value)}

        />





        <input

          className="w-full bg-black border border-gray-700 rounded-xl p-4 mb-4"

          placeholder="Password"

          type="password"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

        />







        <button

          onClick={handleRegister}

          className="w-full bg-white text-black p-4 rounded-xl font-bold"

        >

          Register

        </button>





        <p className="text-center mt-4 text-gray-400">

          {message}

        </p>




      </div>


    </main>

  );

}