"use client";

import { useState } from "react";


export default function ChatWindow({
  user,
  messages,
  sendMessage,
  back,
}: any) {


  const [message,setMessage] = useState("");



  async function handleSend(){


    if(!message.trim())
      return;



    await sendMessage(message);



    setMessage("");


  }





  return (

    <section className="flex flex-col h-full">



      {/* Header */}

      <div className="h-20 border-b border-gray-800 flex items-center px-4 md:px-6 gap-4">


        <button

          onClick={back}

          className="md:hidden text-2xl text-gray-400"

        >

          ←

        </button>




        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center font-bold text-xl">

          {user?.name?.[0]?.toUpperCase()}

        </div>





        <div>


          <h2 className="font-semibold text-lg">

            {user.name}

          </h2>




          <p className="text-sm text-gray-400">

            {user.status}

          </p>



        </div>


      </div>







      {/* Messages */}

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-black to-gray-950">



        {messages.map((msg:any,index:number)=>(


          <div

          key={index}

          className={

          `flex ${
            msg.sender === "me"
            ?
            "justify-end"
            :
            "justify-start"
          }`

          }


          >



            <div

            className={

            `max-w-[80%] md:max-w-sm px-5 py-3 rounded-3xl ${
              
              msg.sender === "me"
              ?
              "bg-white text-black"
              :
              "bg-gray-800 text-white"

            }`

            }


            >


              <p>

                {msg.text}

              </p>


              <p className="text-xs text-gray-500 text-right mt-2">

                {msg.time}

              </p>



            </div>



          </div>


        ))}




      </div>








      {/* Input */}

      <div className="p-3 md:p-4 border-t border-gray-800">



        <div className="flex items-center gap-3 bg-gray-900 rounded-3xl px-4 py-2">



          <input

          value={message}

          onChange={(e)=>setMessage(e.target.value)}

          onKeyDown={(e)=>{

            if(e.key==="Enter")
              handleSend();

          }}

          className="flex-1 bg-transparent outline-none text-white"

          placeholder="اكتب رسالة..."

          />





          <button

          onClick={handleSend}

          className="bg-white text-black rounded-full w-12 h-12 font-bold"

          >

            ➤

          </button>




        </div>




      </div>




    </section>

  );


}