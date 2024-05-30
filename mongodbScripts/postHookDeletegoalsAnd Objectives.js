
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
    $in: [
      ObjectId("6656de2617b129ce226e6ed1"), // Use string representation of ObjectId
      ObjectId("6656e01717b129ce226e6ee4"),
      ObjectId("6656e0b417b129ce226e6ef3"),
       ObjectId("66568ff140d6b955f93af5c8"),
        ObjectId("6657ea83316f2624b03090e0")
    ]
  }
},
{ $set: { deleted: true } }
)
