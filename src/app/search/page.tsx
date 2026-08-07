"use client";

import { useEffect, useState } from "react";

import { searchUsers, sendFriendRequest } from "@/lib/users";
import { listenToAuth } from "@/lib/authListener";


export default function SearchPage() {


  const [currentUser,setCurrentUser] = useState<any>(null);


  const [username,setUsername] = useState("");

  const [results,setResults] = useState<any[]>([]);

  const [message,setMessage] = useState("");





  useEffect(()=>{


    const unsubscribe = listenToAuth((user)=>{

      setCurrentUser(user);

    });


    return ()=>unsubscribe();


  },[]);








  async function handleSearch(){


    if(!username.trim()) return;


    const users = await searchUsers(username);


    setResults(users);



    if(users.length === 0){

      setMessage("لا يوجد مستخدم بهذا الاسم");

    }else{

      setMessage("");

    }


  }









  async function handleAdd(uid:string){


    if(!currentUser){

      setMessage("يجب تسجيل الدخول أولاً");

      return;

    }



    await sendFriendRequest(

      currentUser.uid,

      uid

    );



    setMessage("تم إرسال طلب الإضافة ✅");


  }










  return (

    <main className="min-h-screen bg-black text-white p-6">


      <div className="max-w-xl mx-auto">


        <h1 className="text-3xl font-bold mb-6">

          البحث عن مستخدم 🔎

        </h1>





        <div className="flex gap-3">


          <input

            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-4"

            placeholder="اكتب اسم المستخدم"

            value={username}

            onChange={(e)=>setUsername(e.target.value)}

          />



          <button

            onClick={handleSearch}

            className="bg-white text-black px-6 rounded-xl font-bold"

          >

            بحث

          </button>



        </div>





        <p className="text-gray-400 mt-4">

          {message}

        </p>







        <div className="mt-6 space-y-4">


          {results.map((user:any)=>(


            <div

              key={user.id}

              className="bg-gray-900 p-5 rounded-2xl flex items-center justify-between"

            >


              <div>

                <h2 className="font-bold text-xl">

                  {user.username}

                </h2>


                <p className="text-gray-400">

                  {user.email}

                </p>


              </div>





              <button

                onClick={()=>handleAdd(user.uid)}

                className="bg-white text-black px-4 py-2 rounded-xl"

              >

                إضافة

              </button>




            </div>


          ))}


        </div>



      </div>


    </main>

  );

}