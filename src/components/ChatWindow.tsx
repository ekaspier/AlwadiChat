"use client";

import { useState } from "react";

export default function ChatWindow({
  user,
  messages,
  sendMessage,
  back,
}: any) {

  const [message, setMessage] = useState("");

  async function handleSend() {

    if (!message.trim()) return;

    await sendMessage(message);

    setMessage("");

  }


  return (

    <section className="flex flex-col h-[100dvh] bg-black overflow-hidden">


      {/* Header */}

      <div className="
        h-20
        shrink-0
        border-b
        border-gray-800
        flex
        items-center
        px-4
        gap-4
        bg-black
      ">


        <button
          onClick={back}
          className="
            md:hidden
            text-3xl
            text-gray-400
            active:scale-90
          "
        >
          ‹
        </button>



        <div className="
          w-12
          h-12
          rounded-full
          bg-gray-700
          flex
          items-center
          justify-center
          font-bold
          text-xl
        ">
          {user?.name?.[0]?.toUpperCase()}
        </div>



        <div className="min-w-0">

          <h2 className="font-bold text-lg truncate">
            {user?.name}
          </h2>


          <div className="flex items-center gap-2">

            <span className="
              w-2
              h-2
              rounded-full
              bg-green-500
            "/>


            <p className="text-sm text-gray-400">
              {user?.status}
            </p>

          </div>


        </div>


      </div>





      {/* Messages */}

      <div className="
        flex-1
        overflow-y-auto
        p-4
        space-y-3
        bg-gradient-to-b
        from-black
        to-gray-950
        overscroll-contain
      ">


        {messages.map((msg:any,index:number)=>(


          <div
            key={index}
            className={`
              flex
              ${msg.sender === "me"
                ? "justify-end"
                : "justify-start"
              }
            `}
          >


            <div
              className={`
                max-w-[85%]
                px-4
                py-3
                rounded-3xl
                text-[15px]
                shadow-lg

                ${
                  msg.sender === "me"
                  ?
                  "bg-white text-black rounded-br-md"
                  :
                  "bg-gray-800 text-white rounded-bl-md"
                }
              `}
            >


              <p className="break-words">
                {msg.text}
              </p>


              {msg.time && (

                <p className="
                  text-xs
                  text-gray-500
                  mt-2
                  text-right
                ">
                  {msg.time}
                </p>

              )}


            </div>


          </div>


        ))}


      </div>







      {/* Input */}

      <div className="
        shrink-0
        p-3
        border-t
        border-gray-800
        bg-black
      ">


        <div className="
          flex
          items-center
          gap-3
          bg-gray-900
          rounded-full
          px-4
          py-2
          border
          border-gray-800
        ">



          <input

            value={message}

            onChange={(e)=>setMessage(e.target.value)}

            onKeyDown={(e)=>{

              if(e.key==="Enter")
                handleSend();

            }}

            className="
              flex-1
              bg-transparent
              outline-none
              text-white
              placeholder-gray-500
              py-2
            "

            placeholder="اكتب رسالة..."

          />





          <button

            onClick={handleSend}

            className="
              w-11
              h-11
              rounded-full
              bg-white
              text-black
              font-bold
              active:scale-90
              transition
            "

          >

            ➤

          </button>



        </div>


      </div>


    </section>

  );

}