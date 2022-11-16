const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const FILE_HEADERS = [
  'first_name',
  'last_name',
  'job_title',
  'company',
  'profile_link',
  'gender',
  'business_no',
  'mobile',
  'second_mobile',
  'email',
  'second_email',
  'nationality',
  'description',
]

const UPLOAD_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
}

const uploadSchema = new mongoose.Schema({
  upload_name: {
    type: String,
    trim: true,
  },
  file_location: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    default: UPLOAD_STATUS.ACTIVE,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  tags: {
    type: [
      {
        _id: false,
        tag: {
          type: String,
        },
      },
    ],
  },
})

uploadSchema.plugin(mongoosePaginate)

uploadSchema.index({ 'tags.tag': 1, _id: 1 })

module.exports = {
  Upload: mongoose.model('upload', uploadSchema),
  FILE_HEADERS,
  UPLOAD_STATUS,
}
