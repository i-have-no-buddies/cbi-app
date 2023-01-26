require('../config/mongodb')
const { LeadBatch, UPLOAD_STATUS } = require('../model/LeadBatch')
const { Lead } = require('../model/Lead')
const fs = require('fs')
const csv = require('@fast-csv/parse')

process.on('message', async ({ upload, user_id }) => {
  //var leads = []
  var leadbatch = await LeadBatch.findById(upload._id)
  const stream = fs.createReadStream(`./public/uploads/${upload.file_location}`)
  //add childprocess here
  csv
    .parseStream(stream, { headers: true, ignoreEmpty: true })
    .on('error', (error) => console.error(error))
    .on('data', async (row) => {
      row.lead_batch_id = upload._id
      row.created_by = user_id
      
      //validation
      
      //leads.push(row)
      leadbatch.uploaded++
      
      var lead = new Lead(row);
      await lead.save()
      //upload all first
      // if (leads.length == 500) {
      //   console.log('batch upload')
      //   await Lead.insertMany(leads, { ordered: false })
      //   leads = []
      // }
    })
    .on('end', async (rowCount) => {
      // if (leads.length > 0) {
      //   await Lead.insertMany(leads, { ordered: false })
      // }
      leadbatch.status = UPLOAD_STATUS.ACTIVE
      await leadbatch.save()
    })
})
