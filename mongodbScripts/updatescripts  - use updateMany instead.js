db.getCollection("files").update({  for: 'files', status : false, objective_id : 'ff87d6dd-8b50-41ca-a7af-a995e73dd645' }, {
    $set: {
        status: true
    }
}, {multi : true}
)
