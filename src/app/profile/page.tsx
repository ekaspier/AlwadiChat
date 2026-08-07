"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { listenToAuth } from "@/lib/authListener";
import { getUserProfile } from "@/lib/users";


export default function ProfilePage() {


  const router = useRouter();


  const [profile,setProfile] = useState<any>(null);

  const [loading,setLoading] = useState(true);





  useEffect(()=>{


    const unsubscribe = listenToAuth(async(user)=>{


      if(!user){

        router.replace("/login");

        return;

      }



      const data = await getUserProfile(
        user.uid
      );


      setProfile(data);

      setLoading(false);


    });



    return ()=>unsubscribe();



  },[router]);







  if(loading){


    return (

      <div className="h-screen bg-black text-white flex items-center justify-center">

        Loading...

      </div>

    );

  }







  return (

    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">


      <div className="bg-gray-900 w-full max-w-md rounded-3xl p-8 text-center">



        <div className="w-28 h-28 mx-auto rounded-full bg-gray-700 flex items-center justify-center text-5xl font-bold">

          {profile?.username?.[0] || "U"}

        </div>





        <h1 className="text-3xl font-bold mt-6">

          {profile?.username || "User"}

        </h1>





        <p className="text-gray-400 mt-3">

          {profile?.email}

        </p>





        <button

          onClick={()=>router.push("/")}

          className="mt-8 w-full bg-white text-black py-4 rounded-xl font-bold"

        >

          العودة للشات 💬

        </button>



      </div>


    </main>

  );

}