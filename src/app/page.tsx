"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

import { listenToAuth } from "@/lib/authListener";

import {
  listenToMessages,
  sendMessage as sendFirestoreMessage
} from "@/lib/firebaseFirestore";



export default function Home(){


  const router = useRouter();



  const [currentUser,setCurrentUser] = useState<any>(null);

  const [selectedUser,setSelectedUser] = useState<any>(null);

  const [showChat,setShowChat] = useState(false);

  const [messages,setMessages] = useState<any[]>([]);






  useEffect(()=>{


    const unsubscribe = listenToAuth((user:any)=>{


      if(!user){

        router.push("/login");


      }else{


        setCurrentUser(user);


      }


    });



    return ()=>unsubscribe();



  },[router]);








  useEffect(()=>{


    if(!currentUser || !selectedUser)
      return;





    const unsubscribe = listenToMessages(


      currentUser.uid,


      selectedUser.id,


      (data:any)=>{



        const formatted = data.map((msg:any)=>({



          text:msg.text,



          sender:


          msg.userId === currentUser.uid


          ?


          "me"


          :


          "other",





          time:""



        }));




        setMessages(formatted);



      }


    );




    return ()=>unsubscribe();



  },[currentUser,selectedUser]);









  function selectUser(user:any){


    setSelectedUser(user);


    setShowChat(true);


  }









  async function sendMessage(text:string){



    if(!currentUser || !selectedUser)
      return;





    await sendFirestoreMessage(


      currentUser.uid,


      selectedUser.id,


      text



    );



  }









  if(!currentUser){


    return (


      <div className="h-screen bg-black text-white flex items-center justify-center">


        Loading...


      </div>


    );


  }








  return (


    <main className="flex h-screen bg-black overflow-hidden">





      <div


      className={

      `

      w-full md:w-96

      ${showChat ? "hidden md:block" : "block"}

      `

      }


      >



        <Sidebar

          setSelectedUser={selectUser}

        />



      </div>








      <div


      className={

      `

      flex-1

      ${showChat ? "block" : "hidden md:block"}

      `

      }


      >




        {


          selectedUser ?



          <ChatWindow


            user={selectedUser}


            messages={messages}


            sendMessage={sendMessage}


            back={()=>setShowChat(false)}


          />



          :



          <div className="h-full flex items-center justify-center text-gray-500">


            اختر صديق لبدء المحادثة 💬


          </div>



        }





      </div>






    </main>


  );

}