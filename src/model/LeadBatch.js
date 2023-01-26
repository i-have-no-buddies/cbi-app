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
  'personal_email',
  'work_email',
  'nationality',
  'description',
  'ifa_email',
  'meeting_date',	
  'meeting_time',
  'meeting_address',
  'meeting_note'
]

const UPLOAD_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  INACTIVE: 'INACTIVE',
}

const leadBatchSchema = new mongoose.Schema({
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
    default: UPLOAD_STATUS.PENDING,
  },
  uploaded: {
    type: Number,
    default: 0,
  },
  invalid: {
    type: Number,
    default: 0,
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

leadBatchSchema.index({ 'tags.tag': 1, _id: 1 })

leadBatchSchema.plugin(mongoosePaginate);

module.exports = {
  LeadBatch: mongoose.model('LeadBatch', leadBatchSchema),
  FILE_HEADERS,
  UPLOAD_STATUS,
}
