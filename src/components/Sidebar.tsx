"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseAuthConfig";

import { getFriends } from "@/lib/friends";
import { listenToAuth } from "@/lib/authListener";



export default function Sidebar({
  setSelectedUser
}:any){


  const router = useRouter();


  const [currentUser,setCurrentUser] = useState<any>(null);

  const [friends,setFriends] = useState<any[]>([]);





  useEffect(()=>{


    const unsubscribe = listenToAuth((user)=>{

      setCurrentUser(user);

    });


    return ()=>unsubscribe();


  },[]);







  useEffect(()=>{


    if(!currentUser) return;



    async function loadFriends(){


      const data = await getFriends(
        currentUser.uid
      );


      setFriends(data);


    }



    loadFriends();



  },[currentUser]);









  async function handleLogout(){


    await signOut(auth);


    router.push("/login");


  }







  return (

    <aside className="h-screen bg-gray-950 text-white p-5 overflow-y-auto">


      <h1 className="text-2xl font-bold mb-6">

        AlwadiChat 💬

      </h1>





      <button

        onClick={()=>router.push("/profile")}

        className="w-full bg-gray-800 p-4 rounded-2xl mb-3 text-left font-bold"

      >

        👤 الملف الشخصي

      </button>






      <button

        onClick={handleLogout}

        className="w-full bg-red-600 p-4 rounded-2xl mb-4 text-left font-bold"

      >

        🚪 تسجيل الخروج

      </button>







      <div className="flex gap-2 mb-6">


        <button

          onClick={()=>router.push("/search")}

          className="flex-1 bg-white text-black py-3 rounded-xl font-bold"

        >

          🔍 بحث

        </button>




        <button

          onClick={()=>router.push("/requests")}

          className="flex-1 bg-gray-800 py-3 rounded-xl font-bold"

        >

          📩 طلبات

        </button>



      </div>






      <h2 className="text-gray-400 mb-3">

        الأصدقاء

      </h2>






      {friends.length===0 && (

        <p className="text-gray-500">

          لا يوجد أصدقاء بعد

        </p>

      )}







      <div className="space-y-3">


      {friends.map((friend:any)=>(


        <button


          key={friend.uid}


          onClick={()=>{


            setSelectedUser({

              id:friend.uid,

              name:friend.username,

              status:"Online"


            });


          }}



          className="w-full flex items-center gap-3 bg-gray-900 p-4 rounded-2xl"



        >



          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-xl font-bold">

            {friend.username?.charAt(0).toUpperCase()}

          </div>




          <div>


            <p className="font-bold">

              {friend.username}

            </p>



            <p className="text-sm text-gray-400">

              Online

            </p>



          </div>




        </button>



      ))}



      </div>





    </aside>

  );


}