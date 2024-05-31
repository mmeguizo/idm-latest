
/*
db.getCollection("objectives").updateMany({
        _id: {
          $in: [
    { _id: new ObjectId("6657ea83316f2624b03090e0") },
    { _id: new ObjectId("6656e01717b129ce226e6ee4") },
    { _id: new ObjectId("6656e0b417b129ce226e6ef3") } 
  ]
          ),
        },
      },
      { $set: { deleted: true } }
)

*/
db.getCollection("objectives").updateMany({
  _id: {
    $in: 
     [
    ObjectId("66583879bfe061e8f0fdb6cd") ,
     ObjectId("665838b3bfe061e8f0fdb6d8") ,
     ObjectId("6658393bbfe061e8f0fdb6e8") ,
    ObjectId("66583966bfe061e8f0fdb6f5") ,
   ObjectId("665839acbfe061e8f0fdb703") ,
   ObjectId("66583a03bfe061e8f0fdb712") ,
   ObjectId("66583a33bfe061e8f0fdb71e") 
]
    
  }
},
{ $set: { deleted: true } }
)
