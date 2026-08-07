"use client";

import { useEffect, useState } from "react";

import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest
} from "@/lib/friendRequests";

import { listenToAuth } from "@/lib/authListener";


export default function RequestsPage() {


  const [user,setUser] = useState<any>(null);

  const [requests,setRequests] = useState<any[]>([]);




  useEffect(()=>{


    const unsubscribe = listenToAuth((currentUser)=>{

      setUser(currentUser);

    });


    return ()=>unsubscribe();


  },[]);






  useEffect(()=>{


    if(!user) return;



    async function loadRequests(){


      const data = await getFriendRequests(
        user.uid
      );


      setRequests(data);


    }



    loadRequests();


  },[user]);








  async function accept(id:string){


    await acceptFriendRequest(id);



    setRequests(

      requests.filter(
        (request)=>request.id !== id
      )

    );


  }







  async function reject(id:string){


    await rejectFriendRequest(id);



    setRequests(

      requests.filter(
        (request)=>request.id !== id
      )

    );


  }








  return (

    <main className="min-h-screen bg-black text-white p-6">


      <div className="max-w-xl mx-auto">


        <h1 className="text-3xl font-bold mb-6">

          طلبات الصداقة 🤝

        </h1>




        {requests.length === 0 && (

          <p className="text-gray-400">

            لا يوجد طلبات حالياً

          </p>

        )}






        <div className="space-y-4">


          {requests.map((req:any)=>(


            <div

              key={req.id}

              className="bg-gray-900 rounded-2xl p-5 flex items-center justify-between"

            >


              <div>


                <p className="font-bold text-xl">

                  {req.sender?.username || "مستخدم"}

                </p>


                <p className="text-gray-400 text-sm">

                  طلب إضافة صديق

                </p>


              </div>






              <div className="flex gap-2">


                <button

                  onClick={()=>accept(req.id)}

                  className="bg-white text-black px-4 py-2 rounded-xl"

                >

                  قبول

                </button>





                <button

                  onClick={()=>reject(req.id)}

                  className="bg-gray-700 text-white px-4 py-2 rounded-xl"

                >

                  رفض

                </button>



              </div>



            </div>


          ))}


        </div>



      </div>


    </main>

  );


}