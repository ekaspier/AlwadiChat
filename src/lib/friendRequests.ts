import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";




// جلب طلبات الصداقة الواردة مع اسم المرسل

export async function getFriendRequests(

  uid:string

){


  const q = query(

    collection(
      db,
      "friendRequests"
    ),

    where(
      "to",
      "==",
      uid
    ),

    where(
      "status",
      "==",
      "pending"
    )

  );



  const snapshot = await getDocs(q);




  const requests = await Promise.all(

    snapshot.docs.map(async(requestDoc)=>{


      const data:any = requestDoc.data();




      const userQuery = query(

        collection(
          db,
          "users"
        ),

        where(
          "uid",
          "==",
          data.from
        )

      );



      const userSnapshot = await getDocs(userQuery);



      let sender:any = null;



      if(!userSnapshot.empty){

        sender = userSnapshot.docs[0].data();

      }




      return {

        id:requestDoc.id,

        ...data,

        sender

      };


    })

  );




  return requests;


}








// قبول طلب الصداقة

export async function acceptFriendRequest(

  requestId:string

){


  const requestRef = doc(

    db,

    "friendRequests",

    requestId

  );



  const requestSnap = await getDoc(requestRef);



  if(!requestSnap.exists()) return;



  const data:any = requestSnap.data();





  await updateDoc(

    requestRef,

    {

      status:"accepted"

    }

  );






  await addDoc(

    collection(
      db,
      "friends"
    ),

    {

      users:[

        data.from,

        data.to

      ],

      createdAt:serverTimestamp()

    }

  );


}







// رفض طلب الصداقة

export async function rejectFriendRequest(

  requestId:string

){


  await updateDoc(

    doc(
      db,
      "friendRequests",
      requestId
    ),

    {

      status:"rejected"

    }

  );


}