import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

import { db } from "./firebase";




// إنشاء صداقة

export async function createFriend(

  user1:string,

  user2:string

){


  await addDoc(

    collection(
      db,
      "friends"
    ),

    {

      users:[

        user1,

        user2

      ]

    }

  );


}







// جلب أصدقاء المستخدم

export async function getFriends(

  uid:string

){


  const q = query(

    collection(
      db,
      "friends"
    ),

    where(
      "users",
      "array-contains",
      uid
    )

  );




  const snapshot = await getDocs(q);



  const friends:any[] = [];





  for(const friendDoc of snapshot.docs){


    const data:any = friendDoc.data();




    const otherUid = data.users.find(

      (id:string)=>id !== uid

    );




    if(otherUid){



      const userQuery = query(

        collection(
          db,
          "users"
        ),

        where(
          "uid",
          "==",
          otherUid
        )

      );





      const userSnapshot = await getDocs(userQuery);




      if(!userSnapshot.empty){



        const userData:any = userSnapshot.docs[0].data();




        friends.push({


          id:friendDoc.id,


          uid:otherUid,


          username:userData.username,


          email:userData.email



        });



      }



    }



  }




  return friends;


}