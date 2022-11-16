const { LeadBatch } = require('../model/LeadBatch')
const { Lead } = require('../model/Lead')
const { ngramsAlgo } = require('../utils/helper')
const { fork } = require('child_process')
const navigation = 'upload_lead'
const PER_PAGE = 9

exports.index = async (req, res) => {
  try {
    const page = req.query.page || 1
    const search = {}
    if (req.query.search) {
      search['tags.tag'] = req.query.search.toLowerCase().trim()
    }

    const lead_batch = await LeadBatch.paginate(search, {
      lean: true,
      page,
      limit: PER_PAGE,
    })

    return res.render('lead_management', {
      lead_batch,
      search: req.query.search || '',
      body: req.flash('body')[0],
      errors: req.flash('error')[0],
      navigation,
    })
  } catch (error) {
    console.error(error)
    return res.render(500)
  }
}

exports.upload = async (req, res) => {
  try {
    var lead_batch = new LeadBatch()
    lead_batch.upload_name = req.body.upload_name
    lead_batch.file_location = req.file.filename
    lead_batch.created_by = req.session.AUTH._id
    lead_batch.tags = ngramsAlgo(
      req.body.upload_name.toLowerCase().trim(),
      'tag',
    )
    await lead_batch.save()

    const childProcess = fork('./src/childProcess/uploadLeads.js')
    childProcess.send({ upload: lead_batch, user_id: req.session.AUTH._id })

    res.redirect('/lead-management')
  } catch (error) {
    console.error(error)
    return res.render('500')
  }
}
